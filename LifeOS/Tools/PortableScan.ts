#!/usr/bin/env bun
/**
 * PortableScan — release gate for the Hermes-portable surface of this fork.
 *
 * The repository ships two different kinds of tracked file:
 *
 *   1. The **portable surface** — everything a Hermes install actually deploys
 *      or that a reader is meant to treat as current: the importer and its
 *      workflows, the portable skills, the constitution, the port schemas, and
 *      the repository's own documentation.
 *   2. The **retained legacy payload** — the upstream Claude Code / macOS tree
 *      kept for merge parity and deployed by nothing on the Hermes path. It is
 *      enumerated in `LifeOS/install/CLAUDE_LEGACY.md` and is out of scope here.
 *
 * This tool fails the build when the portable surface regains a private path, a
 * person-specific principal identifier, a live Claude-runtime dependency, or a
 * credential. Anything intentionally retained needs an entry in ALLOWLIST with
 * a reason — and a stale allowlist entry is itself reported, so the list cannot
 * quietly accumulate.
 *
 * Usage:
 *   bun LifeOS/Tools/PortableScan.ts [--json] [--verbose]
 *
 * Exit codes: 0 clean · 1 violations found · 2 could not enumerate files.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { adaptTextForHermes, isPrunedPayloadPath } from "./ImportSkills";

const REPO_ROOT = join(import.meta.dir, "..", "..");

// ── Rules ────────────────────────────────────────────────────────────────────

export interface Rule {
  id: string;
  description: string;
  pattern: RegExp;
  /** Reject a match that is really a false positive (prose, a placeholder…). */
  exempt?: (match: string, line: string) => boolean;
}

export const RULES: Rule[] = [
  {
    id: "private-path",
    description:
      "Absolute path into somebody's real filesystem (drive letter, /Users/<name>, /home/<name>, or a personal cloud-storage layout).",
    // The lookbehind stops prose like "for example:\n" from matching a drive letter.
    // `[/\\]+` so an escaped Windows path (`D:\\Data`) is caught too.
    pattern:
      /(?<![A-Za-z])[A-Za-z]:[/\\]+[A-Za-z0-9_.$<{-]|\/(?:Users|home)\/(?!<|\{|\$)[A-Za-z0-9_.-]+|Dropbox/g,
    exempt: (match) =>
      // `C:/<your-path>`-shaped placeholders are fine; a real path is not.
      /^[A-Za-z]:[/\\]+[<{$]/.test(match),
  },
  {
    id: "principal-id",
    description:
      "Hindsight document_id namespace bound to a literal person rather than the `{id}` / `{user_id}` placeholder.",
    pattern: /user:(?![{<$])[A-Za-z0-9_.-]+:/g,
  },
  {
    id: "principal-name",
    description:
      "The maintainer's given name used as an identity literal (for example a personally-named cognitive model).",
    // Word-bounded so "Aaron Swartz", "Shaaron", and "Paronomasia" do not match.
    pattern: /(?<![A-Za-z])Aron(?![A-Za-z])/g,
  },
  {
    id: "claude-runtime",
    description:
      "Live dependency on the Claude Code runtime tree, including paths assembled in executable code, which no Hermes install deploys.",
    pattern:
      /(?:(?:~|\$HOME|%USERPROFILE%)[/\\]\.claude|(?:path\.)?(?:join|resolve)\([^\n]*(?:homedir\(\)|process\.env\.(?:HOME|USERPROFILE)!?|\bhomeDir\b|\bhome\b|\bHOME\b)[^\n]*["'`]\.claude(?:[/\\]|["'`])|(?:path\.)?(?:join|resolve)\(\s*(?:(?:os\.)?homedir\(\)|process\.env\.(?:HOME|USERPROFILE)!?|\b(?:homeDir|home|HOME)\b)\s*,\s*["'`]\.claude(?:[/\\]|["'`])|\$\{(?:homeDir|home|HOME)\}[/\\]\.claude)/gi,
  },
  {
    id: "claude-tool-api",
    description:
      "Claude Code Skill(...) tool syntax is not executable on Hermes; route through the installed Hermes skill instead.",
    pattern: /\bSkill\(\s*["']/g,
  },
  {
    id: "claude-agent-api",
    description:
      "Claude Code agent-delegation syntax is not executable on Hermes; use delegate_task instead.",
    pattern: /\bAgent\(\s*subagent_type\s*=/g,
  },
  {
    id: "claude-content-tool-api",
    description:
      "Claude Code content-tool call syntax is not executable on Hermes; use the corresponding Hermes tool.",
    pattern:
      /\b(?:WebSearch|WebFetch|Read|Write|Edit|Glob|Grep|AskUserQuestion|TodoWrite)\(\s*/g,
  },
  {
    id: "external-claude-cli",
    description:
      "A Claude CLI command is an optional external adapter, not a Hermes runtime capability, and must be narrowly documented and allowlisted.",
    pattern: /\bclaude\s+--?[A-Za-z][A-Za-z-]*/gi,
  },
  {
    id: "undeployed-runtime",
    description:
      "Reference to a retired LifeOS runtime or state root that Hermes does not provision; use a deployed skill-relative resource, configured workspace/source, or documented Hermes mechanism instead.",
    pattern: /\$HERMES_HOME\/(?:LIFEOS|halos|tools|customizations|telemetry|history|work|evals)(?:[/\\]|\b)|\bLIFEOS[/\\](?:USER|MEMORY)(?:[/\\]|\b)/g,
  },
  {
    id: "credential",
    description: "Assigned credential, API key, or token.",
    pattern:
      /(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|bearer)\s*[:=]\s*["']?[A-Za-z0-9_\-]{16,}|\bsk-[A-Za-z0-9]{20,}|\bghp_[A-Za-z0-9]{20,}|\bxox[abps]-[A-Za-z0-9-]{10,}/gi,
    exempt: (match) =>
      // Documented env-var names and obvious placeholders are not secrets.
      /\b(?:YOUR|EXAMPLE|PLACEHOLDER|xxx+|\.\.\.|<|\{)/i.test(match) ||
      /["']?[A-Z][A-Z0-9_]{12,}$/.test(match),
  },
];

// ── Scope ────────────────────────────────────────────────────────────────────

/**
 * Paths retained purely for upstream-merge parity. Nothing under these
 * prefixes is deployed by `HermesSetup.md` or `ImportSkills.ts`; they are listed
 * in `LifeOS/install/CLAUDE_LEGACY.md` and are deliberately not scanned.
 */
export const LEGACY_PREFIXES = [
  "LifeOS/install/LIFEOS/ALGORITHM/",
  "LifeOS/install/LIFEOS/DOCUMENTATION/",
  "LifeOS/install/LIFEOS/PULSE/",
  "LifeOS/install/LIFEOS/TOOLS/",
  "LifeOS/install/LIFEOS/RULES/",
  "LifeOS/install/LIFEOS/USER_TEMPLATES/",
  "LifeOS/install/LIFEOS/LIFEOS_SYSTEM_PROMPT.md",
  "LifeOS/install/USER/",
  "LifeOS/install/hooks/",
  "LifeOS/install/agents/",
  "LifeOS/install/commands/",
  "LifeOS/install/skills/CLAUDE.md",
  "LifeOS/install/install.sh",
  "LifeOS/install/settings.system.json",
  "LifeOS/install/settings.enhancements.json",
  "LifeOS/install/package.json",
  "LifeOS/install/CLAUDE.template.md",
  "LifeOS/install/LIFEOS/LIFEOS_StatusLine.sh",
  "images/",
];

/** Binary/asset extensions with nothing to scan. */
const SKIP_EXTENSIONS = /\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|mp4|zip|plist|lock)$/i;

export function isLegacyPath(path: string): boolean {
  if (LEGACY_PREFIXES.some((p) => path === p || path.startsWith(p))) return true;
  const skill = path.match(/^LifeOS\/install\/skills\/([^/]+)\//);
  if (skill?.[1].startsWith("_")) return true;
  return false;
}

// ── Allowlist ────────────────────────────────────────────────────────────────

export interface AllowEntry {
  /** Exact repository-relative path. */
  file: string;
  /** Rule id this file is exempt from. */
  rule: string;
  /** Why the match is intentional. Required — an unexplained entry is a bug. */
  reason: string;
}

/**
 * Narrow, per-file, per-rule exemptions. Every entry documents either retained
 * upstream explanatory material or an explicitly optional external adapter.
 * No exempt path may be presented as a bundled Hermes runtime capability.
 */
export const ALLOWLIST: AllowEntry[] = [
  {
    file: "LifeOS/install/skills/Webdesign/Workflows/NativeDesignSync.md",
    rule: "external-claude-cli",
    reason:
      "This workflow explicitly classifies its adapter preflight command as separately managed and makes DirectDesign the Hermes-native default.",
  },
  {
    file: "LifeOS/install/CLAUDE_LEGACY.md",
    rule: "claude-runtime",
    reason:
      "The legacy inventory has to name the upstream ~/.claude tree it is describing as inert.",
  },
  {
    file: "LifeOS/install/PORTABLE_PATHS.md",
    rule: "claude-runtime",
    reason:
      "The portable-path contract quotes the forbidden ~/.claude forms in order to forbid them.",
  },
  {
    file: "LifeOS/Tools/PortableScan.ts",
    rule: "claude-runtime",
    reason: "This scanner's own rule text and documentation name the pattern it rejects.",
  },
  {
    file: "LifeOS/Tools/PortableScan.ts",
    rule: "principal-name",
    reason: "This scanner's own rule text contains the maintainer-name pattern it rejects.",
  },
  {
    file: "LifeOS/Tools/PortableScan.ts",
    rule: "private-path",
    reason: "This scanner's own rule text names the private-path shapes it rejects.",
  },
  {
    file: "tests/import-skills.test.ts",
    rule: "claude-runtime",
    reason: "Importer regression fixtures intentionally contain Claude paths to prove deployment adaptation removes them.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "private-path",
    reason: "Scanner regression fixtures intentionally contain private-path examples that each rule must reject.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "principal-id",
    reason: "Scanner regression fixtures intentionally contain literal principal IDs that the rule must reject.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "principal-name",
    reason: "Scanner regression fixtures intentionally contain the maintainer-name example that the rule must reject.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "claude-runtime",
    reason: "Scanner regression fixtures intentionally contain Claude runtime paths that the rule must reject.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "undeployed-runtime",
    reason: "Scanner regression fixtures intentionally contain retired runtime roots that the rule must reject.",
  },
  {
    file: "tests/portable-scan.test.ts",
    rule: "credential",
    reason: "Scanner regression fixtures intentionally contain a fake assigned credential that the rule must reject.",
  },
  {
    file: "LifeOS/Tools/InstallEngine.ts",
    rule: "claude-runtime",
    reason:
      "Harness detection must know the ~/.claude convention in order to recognise a Claude Code install and route away from it.",
  },
  {
    file: "LifeOS/Tools/InstallEngine.ts",
    rule: "undeployed-runtime",
    reason: "Retained upstream installer internals describe the source system's user-tree contract; Hermes uses ImportSkills.ts instead.",
  },
  {
    file: "LifeOS/Tools/ImportSkills.ts",
    rule: "claude-runtime",
    reason:
      "The importer must recognize exact Claude path constructs so it can remove or adapt them in deployed copies; it does not execute those paths.",
  },
  {
    file: "LifeOS/Tools/ActivateImports.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude activation utility; it is not invoked or deployed by the Hermes installation path.",
  },
  {
    file: "LifeOS/Tools/ActivateImports.ts",
    rule: "undeployed-runtime",
    reason: "Retained upstream import activator; its private user-tree contract is neither invoked nor deployed by the Hermes installation path.",
  },
  {
    file: "LifeOS/Tools/DeployCore.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude core deployer; it is not invoked or deployed by the Hermes installation path.",
  },
  {
    file: "LifeOS/Tools/InstallHooks.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude hook installer; Hermes lifecycle mapping does not invoke it.",
  },
  {
    file: "LifeOS/Tools/InstallSettings.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude settings installer; Hermes uses the separate fail-closed packaged settings adapter.",
  },
  {
    file: "LifeOS/Tools/LinkUser.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude user-linking utility; the Hermes importer never links a personal source tree.",
  },
  {
    file: "LifeOS/Tools/LinkUser.ts",
    rule: "undeployed-runtime",
    reason: "Retained upstream user-linking utility; its source-system user tree is not invoked or provisioned on Hermes.",
  },
  {
    file: "LifeOS/Tools/ScaffoldUser.ts",
    rule: "claude-runtime",
    reason: "Retained upstream Claude user scaffolder; HALOS never creates a principal corpus without explicit configuration and consent.",
  },
  {
    file: "LifeOS/Tools/ScaffoldUser.ts",
    rule: "undeployed-runtime",
    reason: "Retained upstream user scaffolder; HALOS does not create or deploy that private source-system tree.",
  },

  {
    file: "LifeOS/Tools/DeployComponents.ts",
    rule: "claude-runtime",
    reason: "Claude Code deployment tool; not invoked on the Hermes path.",
  },
  {
    file: "LifeOS/Tools/SeedPulse.ts",
    rule: "claude-runtime",
    reason: "Claude Code Pulse seeding tool; not invoked on the Hermes path.",
  },
];

// ── Scanning ─────────────────────────────────────────────────────────────────

export interface Violation {
  file: string;
  line: number;
  rule: string;
  match: string;
  text: string;
}

export interface ScanInput {
  path: string;
  content: string;
}

/**
 * The one surface the importer rewrites: files inside a public skill payload.
 * `_`-prefixed skills are private and never deployed — they are already out of
 * scope via `isLegacyPath`, and excluding them here keeps this predicate an
 * honest description of what ships rather than a broader exemption.
 */
const PUBLIC_SKILL_PAYLOAD = /^LifeOS\/install\/skills\/(?!_)[^/]+\//;

/**
 * Return the content a Hermes installation receives. `ImportSkills.ts` adapts
 * public skill payloads at deploy time, so scanning their upstream source
 * verbatim would report Claude-runtime dependencies that never reach the user.
 *
 * Everything else — repository documentation, `LifeOS/Tools`, the plugins tree,
 * `HERMES.md`, the LIFEOS docs, `PORT_SCHEMAS`, `README.md` — is deployed as
 * written or not deployed at all, so it stays literal and is scanned verbatim.
 */
export function effectivePortableContent(repoRelativePath: string, content: string): string {
  const match = repoRelativePath.match(/^LifeOS\/install\/skills\/([^/]+)\/(.+)$/);
  if (match && isPrunedPayloadPath(match[1], match[2])) return "";
  return PUBLIC_SKILL_PAYLOAD.test(repoRelativePath) ? adaptTextForHermes(content) : content;
}

export interface ScanResult {
  violations: Violation[];
  scanned: number;
  skippedLegacy: number;
  /** Allowlist entries that matched nothing — remove them. */
  staleAllowlist: AllowEntry[];
}

export function scanFiles(
  files: ScanInput[],
  allowlist: AllowEntry[] = ALLOWLIST,
  rules: Rule[] = RULES,
): ScanResult {
  const violations: Violation[] = [];
  const used = new Set<string>();
  const key = (e: { file: string; rule: string }) => `${e.file}\u0000${e.rule}`;
  const allowed = new Set(allowlist.map(key));

  for (const { path, content } of files) {
    for (const rule of rules) {
      if (allowed.has(key({ file: path, rule: rule.id }))) {
        if (rulePresent(rule, content)) used.add(key({ file: path, rule: rule.id }));
        continue;
      }
      for (const m of content.matchAll(rule.pattern)) {
        const index = m.index ?? 0;
        const lineStart = content.lastIndexOf("\n", index - 1) + 1;
        const nextNewline = content.indexOf("\n", index);
        const lineEnd = nextNewline === -1 ? content.length : nextNewline;
        const text = content.slice(lineStart, lineEnd).replace(/\r$/, "");
        if (rule.exempt?.(m[0], text)) continue;
        violations.push({
          file: path,
          line: content.slice(0, index).split(/\r?\n/).length,
          rule: rule.id,
          match: m[0],
          text: text.trim().slice(0, 160),
        });
      }
    }
  }

  return {
    violations,
    scanned: files.length,
    skippedLegacy: 0,
    staleAllowlist: allowlist.filter((e) => !used.has(key(e))),
  };
}

function rulePresent(rule: Rule, content: string): boolean {
  return [...content.matchAll(rule.pattern)].some((m) => {
    const index = m.index ?? 0;
    const lineStart = content.lastIndexOf("\n", index - 1) + 1;
    const nextNewline = content.indexOf("\n", index);
    const lineEnd = nextNewline === -1 ? content.length : nextNewline;
    const text = content.slice(lineStart, lineEnd).replace(/\r$/, "");
    return !rule.exempt?.(m[0], text);
  });
}

// ── Entrypoint ───────────────────────────────────────────────────────────────

export function repositoryFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    maxBuffer: 1 << 28,
  });
  return out.split("\0").filter(Boolean);
}

function main(): void {
  const json = process.argv.includes("--json");
  const verbose = process.argv.includes("--verbose");

  let files: string[];
  try {
    files = repositoryFiles();
  } catch (err) {
    console.error(`✗ could not enumerate repository files: ${(err as Error).message}`);
    process.exit(2);
  }

  const inputs: ScanInput[] = [];
  let skippedLegacy = 0;
  for (const path of files) {
    if (SKIP_EXTENSIONS.test(path)) continue;
    if (isLegacyPath(path)) {
      skippedLegacy++;
      continue;
    }
    const abs = join(REPO_ROOT, path);
    if (!existsSync(abs)) continue;
    inputs.push({ path, content: effectivePortableContent(path, readFileSync(abs, "utf-8")) });
  }

  const result = scanFiles(inputs);
  result.skippedLegacy = skippedLegacy;
  // Exemptions for a retained legacy file are irrelevant to this release
  // surface. Only report stale entries for files that were actually scanned.
  const scannedPaths = new Set(inputs.map((input) => input.path));
  result.staleAllowlist = result.staleAllowlist.filter((entry) => scannedPaths.has(entry.file));

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nPortable-release scan`);
    console.log(`  portable surface scanned: ${result.scanned} files`);
    console.log(`  retained legacy skipped:  ${skippedLegacy} files (see LifeOS/install/CLAUDE_LEGACY.md)`);
    console.log(`  allowlist entries:        ${ALLOWLIST.length}`);

    if (result.violations.length) {
      console.log(`\n  ✗ ${result.violations.length} violation(s):\n`);
      const byRule = new Map<string, Violation[]>();
      for (const v of result.violations) {
        byRule.set(v.rule, [...(byRule.get(v.rule) ?? []), v]);
      }
      for (const [ruleId, vs] of byRule) {
        const rule = RULES.find((r) => r.id === ruleId)!;
        console.log(`  [${ruleId}] ${rule.description}`);
        for (const v of verbose ? vs : vs.slice(0, 20)) {
          console.log(`    ${v.file}:${v.line}  ${v.match}`);
        }
        if (!verbose && vs.length > 20) console.log(`    … and ${vs.length - 20} more (--verbose)`);
        console.log();
      }
    } else {
      console.log(`\n  ✓ no violations on the portable surface`);
    }

    if (result.staleAllowlist.length) {
      console.log(`\n  ✗ ${result.staleAllowlist.length} stale allowlist entry(ies) — the exemption is no longer needed, delete it:`);
      for (const e of result.staleAllowlist) console.log(`    ${e.file}  [${e.rule}]`);
      console.log();
    }
  }

  process.exit(result.violations.length || result.staleAllowlist.length ? 1 : 0);
}

if (import.meta.main) main();

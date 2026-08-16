#!/usr/bin/env bun
/**
 * ImportSkills — copy every public LifeOS skill and the LifeOS runtime plugin
 * into their Hermes-native extension points.
 *
 * Two boundaries are enforced, in order:
 *   1. Private (`_ALLCAPS`) skills are skipped UNCONDITIONALLY — they carry real
 *      names, credentials, and identity-bound preferences. Reported by COUNT only,
 *      never by name (names may leak context).
 *   2. TitleCase dir names are normalized to lowercase-kebab (WorldThreatModel →
 *      world-threat-model; ISA → isa; USMetrics → us-metrics).
 *
 * Collisions are resolved by SHA-256 of SKILL.md: identical → skip; different →
 * reported as a conflict and NOT overwritten (the operator decides).
 *
 * Read-only in --dry-run: prints the full plan, writes nothing.
 *
 * Usage:
 *   bun ImportSkills.ts [--dry-run]
 */

import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, relative } from "node:path";
import { getHarnessSkillsDir } from "./InstallEngine";

/** Source roots containing public skills and the native Hermes plugin payload. */
const SRC_SKILLS = join(import.meta.dir, "..", "install", "skills");
const SRC_PLUGINS = join(import.meta.dir, "..", "install", "plugins");

/**
 * Local dependency/cache artifacts are neither skill resources nor plugin
 * payload. They may exist in the source tree after tests or local execution,
 * but must never enter an installation or affect collision identity.
 */
export function isGeneratedPayloadPath(relativePath: string): boolean {
  const portable = relativePath.replaceAll("\\", "/");
  const segments = portable.split("/");
  if (segments.some((segment) => segment === "__pycache__" || segment === "node_modules")) return true;
  return /(?:^|\/)(?:\.DS_Store|[^/]+\.py[co])$/i.test(portable);
}

function copyPortableTree(from: string, to: string): void {
  cpSync(from, to, {
    recursive: true,
    filter: (source) => {
      const sourceRelative = relative(from, source);
      return sourceRelative === "" || !isGeneratedPayloadPath(sourceRelative);
    },
  });
}

/**
 * Upstream installer machinery retained for source comparison but deliberately
 * absent from the installed `lifeos` skill. The Hermes installer is the
 * repository-level ImportSkills.ts path; recursively shipping a second Claude
 * installer would expose unsupported mutation commands to the principal.
 */
const SOURCE_ONLY_PATHS_BY_SKILL: Readonly<Record<string, ReadonlySet<string>>> = {
  lifeos: new Set([
    "Tools/ActivateImports.ts",
    "Tools/DeployComponents.ts",
    "Tools/DeployCore.ts",
    "Tools/DetectEnv.ts",
    "Tools/InstallEngine.ts",
    "Tools/InstallHooks.ts",
    "Tools/LinkUser.ts",
    "Tools/ScaffoldUser.ts",
    "Tools/ScanConflicts.ts",
    "Tools/SeedPulse.ts",
  ]),
  upgrade: new Set([
    "Tools/Anthropic.ts",
  ]),
  telos: new Set([
    "Tools/UpdateTelos.ts",
  ]),
  "context-search": new Set([
    "Tools/ContextSearch.ts",
  ]),
  research: new Set([
    "Workflows/research.mjs",
    "Workflows/DeepVerifiedResearch.mjs",
  ]),
};

export function isPrunedPayloadPath(sourceSkillName: string, relativePath: string): boolean {
  const normalized = normalizeName(sourceSkillName);
  const portable = relativePath.replaceAll("\\", "/");
  if (normalized === "lifeos" && (portable === "install" || portable.startsWith("install/"))) return true;
  return SOURCE_ONLY_PATHS_BY_SKILL[normalized]?.has(portable) ?? false;
}

function pruneSourceOnlyPayload(root: string, sourceSkillName: string): void {
  const normalized = normalizeName(sourceSkillName);
  const relativePaths = [
    ...(normalized === "lifeos" ? ["install"] : []),
    ...(SOURCE_ONLY_PATHS_BY_SKILL[normalized] ?? []),
  ];
  for (const relativePath of relativePaths) {
    if (!isPrunedPayloadPath(sourceSkillName, relativePath)) continue;
    rmSync(join(root, relativePath), { recursive: true, force: true });
  }
}

// ── Normalization: TitleCase/PascalCase → lowercase-kebab ─────────────────────
/**
 * Mixed-case acronyms the generic rule below mis-splits. Without these,
 * `ArXiv` normalizes to `ar-xiv` and `LifeOS` to `life-os`, neither of which is
 * the name the skill is invoked by. Keyed lowercase so the lookup is
 * case-insensitive on the source directory name.
 */
const NAME_OVERRIDES: Record<string, string> = {
  arxiv: "arxiv",
  lifeos: "lifeos",
  cmux: "cmux",
  html: "html",
  isa: "isa",
};

/**
 * WorldThreatModel → world-threat-model · ISA → isa · HTML → html ·
 * USMetrics → us-metrics · CreateCLI → create-cli · Research → research ·
 * ArXiv → arxiv · LifeOS → lifeos (the last two via NAME_OVERRIDES).
 * Acronym runs stay together; a hyphen is inserted only at real word boundaries.
 */
export function normalizeName(name: string): string {
  const override = NAME_OVERRIDES[name.toLowerCase()];
  if (override) return override;
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camel boundary:  worldT → world-T
    .replace(/([A-Z]+)([A-Z][a-z0-9]+)/g, "$1-$2") // acronym→word: USMetrics → US-Metrics
    .toLowerCase();
}

const HOME_PREFIX = "(?:~|\\$HOME|\\$\\{HOME\\}|%USERPROFILE%)";
const TEXT_EXTENSION = /\.(md|ts|tsx|js|mjs|py|sh|json|ya?ml|hbs|html|css)$/i;

function stripLegacyVoiceNotificationSections(text: string): string {
  const lines = text.split(/\r?\n/);
  const retained: string[] = [];

  for (let index = 0; index < lines.length;) {
    const heading = lines[index].match(/^(#{1,6})\s+.*Voice Notification/i);
    if (!heading) {
      retained.push(lines[index]);
      index += 1;
      continue;
    }

    const level = heading[1].length;
    let end = index + 1;
    while (end < lines.length) {
      const nextHeading = lines[end].match(/^(#{1,6})\s+/);
      if (nextHeading && nextHeading[1].length <= level) {
        break;
      }
      end += 1;
    }

    const section = lines.slice(index, end).join("\n");
    if (/localhost:31337\/notify/i.test(section)) {
      index = end;
      continue;
    }

    retained.push(...lines.slice(index, end));
    index = end;
  }

  return retained.join("\n");
}

/**
 * Adapt only known Claude Code filesystem forms in the *deployed copy* of an
 * upstream payload. The source remains intact for merge parity; the installed
 * Hermes skill never points at a nonexistent Claude home.
 */
export function adaptTextForHermes(text: string): string {
  let adapted = text;

  // The upstream JSONL skill-execution ledger is not installed on Hermes.
  // Remove the append command rather than redirecting it to an invented path.
  adapted = adapted.replace(
    /^.*\.claude[/\\]LIFEOS[/\\]MEMORY[/\\](?:SKILLS[/\\]execution|LEARNING[/\\](?:skill-execution|SKILLS[/\\]execution))\.jsonl.*\r?\n?/gim,
    "",
  );

  // Prefer exact terminators where the template provides them so prose after the
  // preamble is retained even when it precedes the next Markdown heading.
  adapted = adapted.replace(
    /^##[^\r\n]*Voice Notification[^\r\n]*\r?\n[\s\S]*?^\*\*This is not optional\.[^\r\n]*\*\*\r?\n*/gim,
    "",
  );
  adapted = adapted.replace(
    /^##[^\r\n]*Voice Notification[^\r\n]*\r?\n(?:\r?\n)*[ \t]*```bash\r?\n[\s\S]*?localhost:31337\/notify[\s\S]*?^[ \t]*```\r?\n(?:\r?\n)*(?:^Running[^\r\n]*(?:\r?\n|$))?(?:\r?\n)*(?:^---\r?\n)?/gim,
    "",
  );

  // Upstream skills also repeated localhost voice-daemon sections without a
  // stable terminator. Hermes has no such daemon, and redirecting the call
  // would invent a runtime contract. The fallback removes only a peer-heading-
  // bounded Voice Notification section that itself contains the retired endpoint.
  adapted = stripLegacyVoiceNotificationSections(adapted);

  // Mutable principal customizations must not be redirected into the installed
  // skill tree: imported skills are collision-protected, read-only packages.
  // Preserve any suffix after the skill name, but expose an explicit external
  // workspace placeholder for the principal/operator to configure.
  adapted = adapted.replace(
    new RegExp(`${HOME_PREFIX}[/\\\\]\\.claude[/\\\\]LIFEOS[/\\\\]USER[/\\\\]CUSTOMIZATIONS[/\\\\]SKILLS[/\\\\]([A-Za-z0-9_-]+)`, "gi"),
    (_match, name: string) => `<LIFEOS_WORKSPACE>/skills/${normalizeName(name)}`,
  );

  // Public skill-to-skill references have a real Hermes destination.
  adapted = adapted.replace(
    new RegExp(`${HOME_PREFIX}[/\\\\]\\.claude[/\\\\]skills[/\\\\]([A-Za-z0-9_-]+)`, "gi"),
    (match, name: string) =>
      name.startsWith("_")
        ? match
        : `$HERMES_HOME/skills/${normalizeName(name)}`,
  );
  // Placeholder, bracket, and wildcard public-skill paths do not have a literal
  // name for normalizeName(), but their root is still mechanically portable.
  // Keep `_PRIVATE` paths visible so the release scanner forces semantic repair.
  adapted = adapted.replace(
    new RegExp(`${HOME_PREFIX}[/\\\\]\\.claude[/\\\\]skills[/\\\\](?!_)`, "gi"),
    "$HERMES_HOME/skills/",
  );

  // Claude Code's Skill(...) tool syntax is not executable in Hermes. Preserve
  // the requested skill and payload as ordinary Hermes-native routing prose.
  // The patterns intentionally cover only simple Markdown invocations; code or
  // malformed calls remain visible to the portable-release scanner.
  adapted = adapted.replace(
    /\bSkill\(\s*"([A-Za-z0-9_-]+)"\s*,\s*"((?:\\.|[^"\\])*)"\s*\)/g,
    (_match, name: string, request: string) =>
      `the installed \`${normalizeName(name)}\` skill with request "${request}"`,
  );
  adapted = adapted.replace(
    /\bSkill\(\s*'([A-Za-z0-9_-]+)'\s*,\s*'((?:\\.|[^'\\])*)'\s*\)/g,
    (_match, name: string, request: string) =>
      `the installed \`${normalizeName(name)}\` skill with request "${request}"`,
  );
  adapted = adapted.replace(
    /\bSkill\(\s*["']([A-Za-z0-9_-]+)["']\s*\)/g,
    (_match, name: string) => `the installed \`${normalizeName(name)}\` skill`,
  );

  // The deployed installer must neither consult Claude config nor select it as
  // a harness. These are exact source constructs, not generic path guesses.
  adapted = adapted.replaceAll(
    'process.env.CLAUDE_CONFIG_DIR || process.env.HERMES_HOME ?? join(home, ".hermes")',
    '(process.env.HERMES_HOME ?? join(home, ".hermes"))',
  );
  adapted = adapted.replaceAll(
    'harness.configRoot || join(home, ".claude")',
    'harness.configRoot || (process.env.HERMES_HOME ?? join(home, ".hermes"))',
  );
  adapted = adapted.replace(
    /^[ \t]*\{ name: "claude-code", root: \(process\.env\.HERMES_HOME \?\? join\(home, "\.hermes"\)\), skills: "skills", bin: "claude" \},?\r?\n?/gm,
    "",
  );
  adapted = adapted.replaceAll(
    'return { name: "claude-code", configRoot:',
    'return { name: "hermes", configRoot:',
  );
  return adapted;
}

/** Give a namespaced deployment a distinct Hermes routing name. */
export function adaptSkillFrontmatterName(text: string, targetName: string): string {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---/, (frontmatter) =>
    frontmatter.replace(/^name:\s*.*$/m, `name: ${targetName}`),
  );
}

function adaptPayloadTree(root: string): void {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") adaptPayloadTree(path);
      continue;
    }
    if (!entry.isFile() || !TEXT_EXTENSION.test(entry.name)) continue;
    const before = readFileSync(path, "utf-8");
    const after = adaptTextForHermes(before);
    if (after !== before) writeFileSync(path, after);
  }
}

// ── Hashing ──────────────────────────────────────────────────────────────────
function sha256(path: string): string | null {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

/** Hash a deployable directory tree by relative path and content. */
function treeSha256(root: string): string | null {
  try {
    const files: string[] = [];
    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (isGeneratedPayloadPath(relative(root, path))) continue;
        if (entry.isDirectory()) walk(path);
        else if (entry.isFile()) files.push(path);
      }
    };
    walk(root);
    files.sort((a, b) => relative(root, a).localeCompare(relative(root, b)));
    const hash = createHash("sha256");
    for (const path of files) {
      hash.update(relative(root, path).replaceAll("\\", "/"));
      hash.update("\0");
      hash.update(readFileSync(path));
      hash.update("\0");
    }
    return hash.digest("hex");
  } catch {
    return null;
  }
}

function deployedSkillHash(sourceSkillMd: string, targetName: string): string | null {
  try {
    let content = adaptTextForHermes(readFileSync(sourceSkillMd, "utf-8"));
    if (targetName.startsWith("lifeos-")) {
      content = adaptSkillFrontmatterName(content, targetName);
    }
    return createHash("sha256").update(content).digest("hex");
  } catch {
    return null;
  }
}

// ── Result types ─────────────────────────────────────────────────────────────
export interface Plan {
  installed: Array<{ from: string; to: string }>;
  plugins: Array<{ from: string; to: string }>;
  skippedPrivate: number;
  /** Retained for report compatibility. Public skills are never platform-skipped. */
  skippedPlatform: string[];
  collisionsIdentical: string[];
  collisionsConflict: string[];
  invalid: string[];
}

export interface PlanOptions {
  /** Source tree of TitleCase skill directories. Defaults to the install payload. */
  srcSkills?: string;
  /** Source tree of native Hermes plugin directories. Defaults to the install payload. */
  srcPlugins?: string;
  /** Target Hermes skills directory. Only read — `buildPlan` never writes. */
  skillsDir: string;
  /** Target Hermes plugin directory. Defaults beside `skillsDir`. */
  pluginsDir?: string;
}

/**
 * The maintainer's live LifeOS installation carries a private maintenance skill
 * that public imports never receive. Never let a release importer overwrite
 * that configuration plane.
 */
export function isMaintainerTarget(skillsDir: string): boolean {
  return existsSync(join(skillsDir, "_LIFEOS"));
}

/**
 * Pure planning pass: reads both trees, writes nothing. Every code path that
 * mutates the filesystem lives in `applyPlan()`, which `main()` calls only when
 * `--dry-run` is absent.
 */
export function buildPlan(options: PlanOptions): Plan {
  const srcSkills = options.srcSkills ?? SRC_SKILLS;
  const { skillsDir } = options;
  const srcPlugins = options.srcPlugins ?? SRC_PLUGINS;
  const pluginsDir = options.pluginsDir ?? join(skillsDir, "..", "plugins");

  const plan: Plan = {
    installed: [],
    plugins: [],
    skippedPrivate: 0,
    skippedPlatform: [],
    collisionsIdentical: [],
    collisionsConflict: [],
    invalid: [],
  };
  if (!existsSync(srcSkills)) {
    throw new Error(`source skills dir not found: ${srcSkills}`);
  }
  for (const entry of readdirSync(srcSkills, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const name = entry.name;

    // 1. Private boundary — unconditional, counted only (never named).
    if (name.startsWith("_")) {
      plan.skippedPrivate++;
      continue;
    }
    // 2. A skill dir without a SKILL.md is not a skill.
    const srcSkillMd = join(srcSkills, name, "SKILL.md");
    if (!existsSync(srcSkillMd)) {
      plan.invalid.push(name);
      continue;
    }
    // 3. Normalize + collision-check on SKILL.md hash.
    const normalized = normalizeName(name);
    const targetDir = join(skillsDir, normalized);
    const targetSkillMd = join(targetDir, "SKILL.md");
    if (existsSync(targetDir)) {
      if (existsSync(targetSkillMd)) {
        const same = deployedSkillHash(srcSkillMd, normalized) === sha256(targetSkillMd);
        if (same) {
          plan.collisionsIdentical.push(normalized);
          continue;
        }
      }
      // Preserve an existing native/community skill or category directory and
      // still install the LifeOS capability. A conflict must not become either
      // feature deletion or a recursive merge into an unrelated container.
      const namespaced = join(skillsDir, `lifeos-${normalized}`);
      const namespacedSkillMd = join(namespaced, "SKILL.md");
      if (!existsSync(namespaced)) {
        plan.installed.push({ from: join(srcSkills, name), to: namespaced });
        continue;
      }
      const namespacedSame =
        existsSync(namespacedSkillMd) &&
        deployedSkillHash(srcSkillMd, `lifeos-${normalized}`) === sha256(namespacedSkillMd);
      (namespacedSame ? plan.collisionsIdentical : plan.collisionsConflict).push(`lifeos-${normalized}`);
      continue;
    }
    plan.installed.push({ from: join(srcSkills, name), to: targetDir });
  }
  if (existsSync(srcPlugins)) {
    for (const entry of readdirSync(srcPlugins, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
      const from = join(srcPlugins, entry.name);
      if (!existsSync(join(from, "plugin.yaml"))) {
        plan.invalid.push(`plugin:${entry.name}`);
        continue;
      }
      const to = join(pluginsDir, entry.name);
      const targetManifest = join(to, "plugin.yaml");
      if (existsSync(targetManifest)) {
        const same = treeSha256(from) === treeSha256(to);
        (same ? plan.collisionsIdentical : plan.collisionsConflict).push(`plugin:${entry.name}`);
        continue;
      }
      plan.plugins.push({ from, to });
    }
  }
  return plan;
}

// ── Apply ────────────────────────────────────────────────────────────────────
export function applyPlan(plan: Plan, skillsDir: string): void {
  mkdirSync(skillsDir, { recursive: true });
  for (const { from, to } of plan.installed) {
    copyPortableTree(from, to);
    pruneSourceOnlyPayload(to, basename(from));
    adaptPayloadTree(to);
    const targetName = to.split(/[\\/]/).pop()!;
    if (targetName.startsWith("lifeos-")) {
      const skillMd = join(to, "SKILL.md");
      const before = readFileSync(skillMd, "utf-8");
      const after = adaptSkillFrontmatterName(before, targetName);
      if (after !== before) writeFileSync(skillMd, after);
    }
  }
  for (const { from, to } of plan.plugins) {
    mkdirSync(join(to, ".."), { recursive: true });
    copyPortableTree(from, to);
  }
  // Record provenance: imported skills are `source: local` (survive Hermes curator
  // lifecycle, clearly marked as imported — distinct from `builtin`/`official`).
  const manifestPath = join(skillsDir, ".lifeos-import.json");
  let prior: Record<string, unknown> = {};
  if (existsSync(manifestPath)) {
    try {
      prior = JSON.parse(readFileSync(manifestPath, "utf-8"));
    } catch {
      prior = {};
    }
  }
  const skills = { ...((prior.skills as Record<string, string>) ?? {}) };
  for (const { to } of plan.installed) skills[to.split(/[\\/]/).pop()!] = "local";
  writeFileSync(
    manifestPath,
    JSON.stringify({ source: "lifeos", trust: "local", skills }, null, 2),
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
/**
 * Render the plan as text. Private skills are reported by COUNT only — their
 * names may carry context and must never reach stdout or a setup transcript.
 */
export function formatReport(plan: Plan, skillsDir: string, dryRun: boolean): string {
  const tag = dryRun ? "[dry-run] " : "";
  const out: string[] = [];
  out.push(`\n${tag}LifeOS → Hermes skill import`);
  out.push(`  target: ${skillsDir}\n`);

  out.push(`  ${dryRun ? "would install" : "installed"} skills: ${plan.installed.length}`);
  for (const { from, to } of plan.installed) {
    out.push(`    ${from.split(/[\\/]/).pop()}  →  ${to.split(/[\\/]/).pop()}`);
  }
  out.push(`  skipped (private):  ${plan.skippedPrivate}`);
  out.push(`  skipped (platform): ${plan.skippedPlatform.length}`);
  out.push(`  ${dryRun ? "would install" : "installed"} plugins: ${plan.plugins.length}`);
  for (const { from, to } of plan.plugins) out.push(`    ${from.split(/[\\/]/).pop()}  →  ${to.split(/[\\/]/).pop()}`);
  out.push(`  collisions (identical, skipped): ${plan.collisionsIdentical.length}${plan.collisionsIdentical.length ? `  (${plan.collisionsIdentical.join(", ")})` : ""}`);
  out.push(`  collisions (CONFLICT, not written): ${plan.collisionsConflict.length}${plan.collisionsConflict.length ? `  (${plan.collisionsConflict.join(", ")})` : ""}`);
  if (plan.invalid.length) out.push(`  skipped (no SKILL.md): ${plan.invalid.join(", ")}`);

  const total =
    plan.installed.length +
    plan.plugins.length +
    plan.skippedPrivate +
    plan.skippedPlatform.length +
    plan.collisionsIdentical.length +
    plan.collisionsConflict.length +
    plan.invalid.length;
  out.push(`  total scanned: ${total}`);

  if (plan.collisionsConflict.length) {
    out.push(`\n  ⚠ ${plan.collisionsConflict.length} conflict(s): a differing SKILL.md already exists.`);
    out.push(`    Resolve by hand — nothing was overwritten. See HermesSetup.md step 4 (conflict branch).`);
  }

  out.push(`\n  Next steps:`);
  if (plan.plugins.length) out.push(`    hermes plugins enable lifeos  # opt in to the LifeOS runtime plugin`);
  out.push(`    hermes skills list        # verify the imported LifeOS skills appear`);
  out.push(`    /reload-skills            # load the new skill body into an active session`);
  if (dryRun) out.push(`\n  Re-run without --dry-run to write.`);
  return out.join("\n");
}

// ── Entrypoint ───────────────────────────────────────────────────────────────
function main(): void {
  const dryRun = process.argv.includes("--dry-run");
  const home = homedir();
  const skillsDir = getHarnessSkillsDir("hermes", home);

  if (isMaintainerTarget(skillsDir)) {
    console.error(
      "✗ refusing to import into a maintainer/source LifeOS skill tree " +
        "($HERMES_HOME/skills/_LIFEOS is present). Use an isolated target profile instead.",
    );
    process.exit(2);
  }

  let plan: Plan;
  try {
    plan = buildPlan({ skillsDir });
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  }
  if (!dryRun) applyPlan(plan, skillsDir);
  console.log(formatReport(plan, skillsDir, dryRun));
  process.exit(0);
}

// Only run as a CLI. Importing this module (tests, other tools) must not execute.
if (import.meta.main) main();

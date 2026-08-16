#!/usr/bin/env bun
/**
 * InstallSettings — Hermes configuration adapter for the LifeOS payload.
 *
 * The payload ships `Resources/settings-migration-manifest.json`, a portable
 * inventory distilled from the upstream settings file authored for a different
 * harness. Hermes has no equivalent of most of those settings. This tool
 * therefore does NOT install them. It **reports** the manifest against Hermes'
 * own configuration surface — `config.yaml` under
 * the Hermes home, written through the documented `hermes config set KEY VALUE`
 * CLI — and classifies every single source setting as one of:
 *
 *   mapped                        A Hermes key with confirmed equivalent
 *                                 semantics exists, and the value converts
 *                                 without guessing.
 *   requires-principal-decision   A related Hermes key may exist, but choosing
 *                                 it or its value would be a guess. The
 *                                 principal decides; this tool will not.
 *   unsupported                   Hermes has no analogue. Nothing to do.
 *
 * Honesty is the whole point. The report lists ONLY operations this tool has
 * verified against the Hermes configuration schema, and never implies that a
 * setting it could not map was carried over. The declared mapping table must
 * account for every top-level key and every `env` key in the template — an
 * unaccounted key is reported as `undeclaredTemplateKeys` and fails the run, so
 * the table cannot silently drift behind the payload.
 *
 * Secrets boundary: no `env` value is ever migrated into `config.yaml` or
 * `.env`. `hermes config set` routes credential-shaped keys to `.env`, so
 * forwarding an env block wholesale would plant secrets in a file the principal
 * never chose to write. This tool only ever emits a literal declared Hermes key
 * with a converted scalar, and reports no raw source values at all.
 *
 * Dry-run by default. `--apply` executes only the declared mapped operations,
 * with `HERMES_HOME` set to the selected home in the child environment, after
 * snapshotting an existing `config.yaml`. It refuses a maintainer/source tree.
 *
 * Usage:
 *   bun InstallSettings.ts [--hermes-home <dir>] [--skill-root <dir>] [--apply]
 *
 * Exit codes: 0 report clean · 1 template/mapping/apply failure · 2 refused.
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// ── Target resolution ────────────────────────────────────────────────────────

/**
 * Resolve the Hermes home this run targets. `HERMES_HOME` wins, then the
 * conventional `~/.hermes`. Hermes' own default is platform-native and differs
 * on some platforms — when `HERMES_HOME` is unset there, pass `--hermes-home`
 * explicitly rather than letting this fall back.
 */
export function resolveHermesHome(explicit?: string, env: NodeJS.ProcessEnv = process.env): string {
  const fromEnv = (env.HERMES_HOME ?? "").trim();
  return explicit || fromEnv || join(homedir(), ".hermes");
}

/** `config.yaml` is the Hermes configuration file. There is no `settings.json`. */
export function configPathFor(hermesHome: string): string {
  return join(hermesHome, "config.yaml");
}

// ── Source-tree refusal ──────────────────────────────────────────────────────

/**
 * Markers that identify a maintainer or source tree rather than an installed
 * Hermes home. Writing configuration into one of these would mutate the
 * authoring environment instead of the principal's install.
 */
export const SOURCE_TREE_MARKERS: Array<[marker: string, why: string]> = [
  [join("LifeOS", "install", "skills"), "the LifeOS release payload — this is a source checkout, not a Hermes home"],
  ["PORT_SCHEMAS", "the port-schema tree that sits beside the release payload"],
  [join("hermes_cli", "config_defaults.py"), "the Hermes Agent source tree itself"],
];

/** The private maintenance plane exists only in a maintainer/source target. */
function hasPrivateMaintainerPlane(root: string): boolean {
  return existsSync(join(root, "skills", "_LIFEOS"));
}

/** Return the reason this root must not be written to, or `null` if it is fine. */
export function detectSourceTree(root: string): string | null {
  if (hasPrivateMaintainerPlane(root)) return "skills/_LIFEOS — the maintainer's private skill plane";
  for (const [marker, why] of SOURCE_TREE_MARKERS) {
    if (existsSync(join(root, marker))) return `${marker} — ${why}`;
  }
  return null;
}

// ── Mapping table ────────────────────────────────────────────────────────────

export type Classification = "mapped" | "requires-principal-decision" | "unsupported";

export interface MappingRule {
  /** Dotted path in the migration manifest; `env.NAME` names one source env var. */
  source: string;
  classification: Classification;
  /** Hermes `config.yaml` key. Required for — and only for — `mapped`. */
  hermesKey?: string;
  /** Where the Hermes key and its semantics were confirmed. Required for `mapped`. */
  verified?: string;
  /** Convert the template value to the string `hermes config set` receives. */
  convert?: (value: unknown) => string;
  reason: string;
}

/** Milliseconds → whole seconds, the unit `terminal.timeout` is defined in. */
export function msToSeconds(value: unknown): string {
  const ms = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(ms) || ms <= 0) throw new Error(`not a positive millisecond count: ${JSON.stringify(value)}`);
  return String(Math.max(1, Math.round(ms / 1000)));
}

/** Booleans only — a truthy-looking string would be a guess about intent. */
export function toBoolean(value: unknown): string {
  if (typeof value !== "boolean") throw new Error(`not a boolean: ${JSON.stringify(value)}`);
  return value ? "true" : "false";
}

/**
 * Every top-level key and every `env` key the shipped template contains. Only
 * the two `mapped` rules below carry a Hermes key; each names where its
 * semantics were confirmed. Everything else is reported, never applied.
 */
export const MAPPINGS: MappingRule[] = [
  // ── mapped ────────────────────────────────────────────────────────────────
  {
    source: "env.BASH_DEFAULT_TIMEOUT_MS",
    classification: "mapped",
    hermesKey: "terminal.timeout",
    verified: "hermes_cli DEFAULT_CONFIG terminal.timeout — command execution timeout, integer seconds (default 180)",
    convert: msToSeconds,
    reason: "Both bound how long a single shell command may run. Same semantic, different unit: the source is milliseconds, terminal.timeout is seconds.",
  },
  {
    source: "fileCheckpointingEnabled",
    classification: "mapped",
    hermesKey: "checkpoints.enabled",
    verified: "hermes_cli DEFAULT_CONFIG checkpoints.enabled — pre-write filesystem snapshots, boolean (default false)",
    convert: toBoolean,
    reason: "Both switch on automatic filesystem snapshots taken before the agent's destructive file operations.",
  },

  // ── env, everything else ──────────────────────────────────────────────────
  {
    source: "env.LIFEOS_DIR",
    classification: "requires-principal-decision",
    reason: "Names where the LifeOS content tree lives. Hermes deploys skills under HERMES_HOME/skills and has no config key declaring a LifeOS root; the template's value is a path in the other harness's tree. The principal chooses the location.",
  },
  {
    source: "env.LIFEOS_CONFIG_DIR",
    classification: "requires-principal-decision",
    reason: "Second name for the same LifeOS tree. Same decision as LIFEOS_DIR, and no Hermes key to hold it.",
  },
  {
    source: "env.PROJECTS_DIR",
    classification: "requires-principal-decision",
    reason: "A projects root. The nearest Hermes key, terminal.cwd, is the per-session working directory rather than a library of project roots — writing this path there would change a different thing.",
  },
  {
    source: "env.API_TIMEOUT_MS",
    classification: "requires-principal-decision",
    reason: "A single provider-request timeout. Hermes splits this across several keys with different scopes (agent.gateway_timeout, the per-task auxiliary.*.timeout family); which one the principal means cannot be inferred from one number.",
  },
  {
    source: "env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
    classification: "unsupported",
    reason: "Feature flag for the other harness's agent-teams experiment. Hermes has no teams concept — its delegation.* subsystem is a different model, not a renamed one.",
  },
  {
    source: "env.CLAUDE_CODE_FORK_SUBAGENT",
    classification: "unsupported",
    reason: "Feature flag for the other harness's subagent-fork behaviour. Hermes spawns children through delegation.*, which this flag does not describe.",
  },

  // ── top-level, everything else ────────────────────────────────────────────
  {
    source: "$schema",
    classification: "unsupported",
    reason: "A JSON Schema pointer for the other harness's settings file. config.yaml carries no schema declaration.",
  },
  {
    source: "skillListingBudgetFraction",
    classification: "unsupported",
    reason: "A fraction of the context window reserved for the skill listing. The Hermes skills.* block has no listing-budget key and no equivalent mechanism.",
  },
  {
    source: "env",
    classification: "requires-principal-decision",
    reason: "Environment block. Each key is classified individually below; the block itself is never forwarded, because env values must not be migrated into config.yaml or .env.",
  },
  {
    source: "includeGitInstructions",
    classification: "unsupported",
    reason: "Toggles the other harness's built-in git prompt block. Hermes composes its coding brief differently and exposes no such switch.",
  },
  {
    source: "permissions",
    classification: "requires-principal-decision",
    reason: "An allow/deny/ask matcher list in the other harness's pattern language. Hermes gates tools through approvals.* and command_allowlist, whose matching rules differ — translating these entries mechanically would change what is permitted.",
  },
  {
    source: "autoMode",
    classification: "requires-principal-decision",
    reason: "Prose allow rules plus a hard-deny list for the other harness's auto-approval judge. Hermes' approvals.smart_policy is a different mechanism; carrying these strings over would grant permissions the principal never reviewed.",
  },
  {
    source: "skipDangerousModePermissionPrompt",
    classification: "requires-principal-decision",
    reason: "Suppresses a confirmation prompt. Hermes has its own confirmation keys (approvals.destructive_slash_confirm and friends) covering different prompts; silently disabling one of them is the principal's call.",
  },
  {
    source: "skipAutoPermissionPrompt",
    classification: "requires-principal-decision",
    reason: "Suppresses a second, distinct approval prompt in the other harness. Same reasoning as skipDangerousModePermissionPrompt — no confirmed one-to-one Hermes key.",
  },
  {
    source: "worktree",
    classification: "unsupported",
    reason: "Sparse-path and base-ref settings for the other harness's worktree feature. Hermes has no worktree configuration block.",
  },
  {
    source: "allowedHttpHookUrls",
    classification: "unsupported",
    reason: "Allowlist for the other harness's HTTP hook transport. The Hermes hooks block carries no URL allowlist.",
  },
  {
    source: "httpHookAllowedEnvVars",
    classification: "unsupported",
    reason: "Companion allowlist for the same HTTP hook transport, which Hermes does not implement.",
  },
  {
    source: "statusLine",
    classification: "unsupported",
    reason: "Runs an external command to render the other harness's status line. Hermes renders its own footer from display.runtime_footer fields and cannot execute a status-line command.",
  },
  {
    source: "enabledPlugins",
    classification: "unsupported",
    reason: "Enables plugins from that harness's marketplace. Hermes plugins are a separate system with their own installation path, not a config.yaml list.",
  },
  {
    source: "extraKnownMarketplaces",
    classification: "unsupported",
    reason: "Registers a git marketplace for the plugin system above, which Hermes does not share.",
  },
  {
    source: "awaySummaryEnabled",
    classification: "unsupported",
    reason: "Toggles that harness's away-summary feature. Hermes has no equivalent.",
  },
  {
    source: "tui",
    classification: "requires-principal-decision",
    reason: "Selects a TUI variant of the other harness. Hermes' display.interface chooses between its own cli and tui front ends — a related but not equivalent choice, and the principal's interface preference is not implied by this value.",
  },
  {
    source: "autoMemoryEnabled",
    classification: "requires-principal-decision",
    reason: "Automatic memory capture. Hermes has memory.memory_enabled, but it governs a different memory provider stack; enabling or disabling the principal's memory subsystem from a template default would be a guess.",
  },
  {
    source: "theme",
    classification: "requires-principal-decision",
    reason: "A light/dark theme name. The nearest Hermes key, display.skin, selects a named skin rather than a light/dark mode, so 'dark' has no confirmed translation.",
  },
  {
    source: "editorMode",
    classification: "unsupported",
    reason: "Chooses normal vs vim editing keys in that harness's input box. Hermes exposes no editor-mode key.",
  },
  {
    source: "teammateMode",
    classification: "unsupported",
    reason: "Belongs to the same agent-teams feature as CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS, which Hermes does not have.",
  },
  {
    source: "remoteControlAtStartup",
    classification: "requires-principal-decision",
    reason: "Opens a remote-control channel at startup. Hermes' gateway is the comparable surface but is configured and launched separately; turning on a remote channel is a decision the principal must make deliberately.",
  },
  {
    source: "inputNeededNotifEnabled",
    classification: "unsupported",
    reason: "Desktop notification when that harness needs input. Hermes' notification surfaces are per-platform gateway settings, not this switch.",
  },
  {
    source: "agentPushNotifEnabled",
    classification: "unsupported",
    reason: "Push notification for agent completion in that harness. Same reasoning as inputNeededNotifEnabled.",
  },
  {
    source: "voiceEnabled",
    classification: "requires-principal-decision",
    reason: "A single voice master switch. Hermes splits voice across the voice.* capture block and a separate tts.* block with no single enable key, so which one this means is the principal's call.",
  },
  {
    source: "principal",
    classification: "requires-principal-decision",
    reason: "Mirrors principal fields for runtime readers. Hermes has a top-level timezone key that could hold the timezone field, but the template value is a placeholder default rather than the principal's actual zone — writing it would assert something unknown.",
  },
  {
    source: "loadAtStartup",
    classification: "unsupported",
    reason: "Startup file-injection list for the other harness. Hermes loads its own context files (SOUL.md, AGENTS.md, .hermes.md) by convention, with no configurable list.",
  },
  {
    source: "dynamicContext",
    classification: "unsupported",
    reason: "Switches for context blocks injected by that harness's LoadContext hook. Those hooks are not part of a Hermes install, so the switches address nothing.",
  },
  {
    source: "postCompactRestore",
    classification: "unsupported",
    reason: "Files re-injected after that harness's compaction. Hermes' compression.* block governs what survives compaction by message policy, not by re-reading a file list.",
  },
  {
    source: "contextDisplay",
    classification: "requires-principal-decision",
    reason: "A compaction threshold expressed as a percentage of the window. Hermes' compression.threshold is a ratio with its own small-context floor and per-model overrides; transcribing 83 into that scale would change when compaction fires.",
  },
  {
    source: "feedbackSurveyState",
    classification: "unsupported",
    reason: "Bookkeeping for that harness's feedback survey. Not configuration, and Hermes has no such survey.",
  },
  {
    source: "preferences",
    classification: "unsupported",
    reason: "A unit preference for that harness's built-in formatting. Hermes carries no unit-preference key.",
  },
];

// ── Classification ───────────────────────────────────────────────────────────

export interface ClassifiedSetting {
  source: string;
  classification: Classification;
  /** Only set when `mapped`. */
  hermesKey: string | null;
  /** Only set when `mapped`. Derived from the template, never a raw source value. */
  hermesValue: string | null;
  reason: string;
}

export interface ConfigOperation {
  key: string;
  value: string;
  from: string;
  verified: string;
  /** Exactly what `--apply` would execute. */
  command: string[];
}

export interface ClassificationReport {
  settings: ClassifiedSetting[];
  operations: ConfigOperation[];
  /** Template keys with no rule — the mapping table is behind the payload. */
  undeclaredTemplateKeys: string[];
  /** Rules whose source is absent from the template — the table is ahead of it. */
  unusedRules: string[];
  summary: Record<Classification, number>;
}

/**
 * Every source setting the template actually contains: each top-level key, plus
 * one entry per `env` key. `env` itself is included so the block is accounted
 * for explicitly rather than by omission.
 */
export function templateSources(template: Record<string, unknown>): string[] {
  const sources: string[] = [];
  for (const key of Object.keys(template)) {
    sources.push(key);
    if (key === "env" && template.env && typeof template.env === "object") {
      for (const name of Object.keys(template.env as Record<string, unknown>)) sources.push(`env.${name}`);
    }
  }
  return sources;
}

/** Read a `a.b` path out of the template. */
function valueAt(template: Record<string, unknown>, source: string): unknown {
  return source.split(".").reduce<unknown>(
    (node, part) => (node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined),
    template,
  );
}

export function classifyTemplate(
  template: Record<string, unknown>,
  rules: MappingRule[] = MAPPINGS,
): ClassificationReport {
  const bySource = new Map(rules.map((r) => [r.source, r]));
  const sources = templateSources(template);
  const present = new Set(sources);

  const settings: ClassifiedSetting[] = [];
  const operations: ConfigOperation[] = [];
  const undeclaredTemplateKeys: string[] = [];

  for (const source of sources) {
    const rule = bySource.get(source);
    if (!rule) {
      undeclaredTemplateKeys.push(source);
      continue;
    }

    if (rule.classification !== "mapped") {
      settings.push({ source, classification: rule.classification, hermesKey: null, hermesValue: null, reason: rule.reason });
      continue;
    }

    // A declared mapping that cannot convert this template's value is not a
    // mapping — report the failure instead of inventing a value.
    let value: string;
    try {
      value = rule.convert!(valueAt(template, source));
    } catch (err) {
      settings.push({
        source,
        classification: "requires-principal-decision",
        hermesKey: null,
        hermesValue: null,
        reason: `Declared mapping to ${rule.hermesKey} could not convert the template value (${(err as Error).message}), so no operation is proposed.`,
      });
      continue;
    }

    settings.push({ source, classification: "mapped", hermesKey: rule.hermesKey!, hermesValue: value, reason: rule.reason });
    operations.push({
      key: rule.hermesKey!,
      value,
      from: source,
      verified: rule.verified!,
      command: ["hermes", "config", "set", rule.hermesKey!, value],
    });
  }

  const summary: Record<Classification, number> = {
    mapped: 0,
    "requires-principal-decision": 0,
    unsupported: 0,
  };
  for (const s of settings) summary[s.classification]++;

  return {
    settings,
    operations,
    undeclaredTemplateKeys,
    unusedRules: rules.filter((r) => !present.has(r.source)).map((r) => r.source),
    summary,
  };
}

// ── Apply ────────────────────────────────────────────────────────────────────

export interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
}

/** The one execution seam. Tests inject a fake; nothing else runs a command. */
export type ConfigRunner = (argv: string[], env: NodeJS.ProcessEnv) => RunResult;

export const hermesConfigRunner: ConfigRunner = (argv, env) => {
  const [command, ...rest] = argv;
  const r = spawnSync(command, rest, { env, encoding: "utf8" });
  return {
    code: r.status ?? 1,
    stdout: r.stdout ?? "",
    stderr: r.stderr || (r.error ? r.error.message : ""),
  };
};

export interface ExecutedOperation extends ConfigOperation {
  code: number;
  stdout: string;
  stderr: string;
}

export interface ApplyReport {
  ok: boolean;
  /** Path of the pre-mutation snapshot, or `null` when there was no config.yaml. */
  backup: string | null;
  executed: ExecutedOperation[];
  /** The operation key that failed, if any. Remaining operations were not run. */
  stoppedAt: string | null;
}

export interface ApplyOptions {
  hermesHome: string;
  configPath: string;
  runner?: ConfigRunner;
  env?: NodeJS.ProcessEnv;
  now?: Date;
}

/**
 * Execute the declared mapped operations and nothing else. Snapshots an
 * existing config.yaml first, and stops at the first failing command so a
 * half-applied run is visible rather than papered over.
 */
export function applyOperations(operations: ConfigOperation[], options: ApplyOptions): ApplyReport {
  const { hermesHome, configPath } = options;
  const runner = options.runner ?? hermesConfigRunner;
  const baseEnv = options.env ?? process.env;
  const stamp = (options.now ?? new Date()).toISOString().replace(/[:.]/g, "-");

  let backup: string | null = null;
  if (operations.length && existsSync(configPath)) {
    backup = `${configPath}.backup-${stamp}`;
    copyFileSync(configPath, backup);
  }

  const executed: ExecutedOperation[] = [];
  let stoppedAt: string | null = null;

  for (const op of operations) {
    const result = runner(op.command, { ...baseEnv, HERMES_HOME: hermesHome });
    executed.push({ ...op, ...result });
    if (result.code !== 0) {
      stoppedAt = op.key;
      break;
    }
  }

  return { ok: stoppedAt === null, backup, executed, stoppedAt };
}

// ── Entrypoint ───────────────────────────────────────────────────────────────

const SECRETS_POLICY =
  "No env value is migrated into config.yaml or .env. Only declared Hermes keys with converted scalars are emitted, and no raw source value appears in this report.";

interface Args {
  hermesHome: string;
  skillRoot: string;
  apply: boolean;
}

export function parseArgs(argv: string[], env: NodeJS.ProcessEnv = process.env): Args {
  if (argv.includes("--config-root")) {
    throw new Error("--config-root is retired: this tool targets a Hermes home, not a harness config root. Use --hermes-home <dir>.");
  }
  if (argv.includes("--allow-dev")) {
    throw new Error("--allow-dev is not supported: maintainer and source targets are always refused.");
  }
  const get = (flag: string): string | undefined => {
    const i = argv.indexOf(flag);
    return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : undefined;
  };
  return {
    hermesHome: resolveHermesHome(get("--hermes-home"), env),
    skillRoot: get("--skill-root") || join(import.meta.dir, ".."),
    apply: argv.includes("--apply"),
  };
}

function fail(error: string, code: number): never {
  console.log(JSON.stringify({ ok: false, error }, null, 2));
  process.exit(code);
}

function main(): void {
  let args: Args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    fail((err as Error).message, 2);
  }

  const configPath = configPathFor(args.hermesHome);
  const templatePath = join(args.skillRoot, "Resources", "settings-migration-manifest.json");

  const sourceTree = detectSourceTree(args.hermesHome);
  if (sourceTree) {
    fail(`source tree detected at ${args.hermesHome} (${sourceTree}) — refusing to write configuration there`, 2);
  }
  if (!existsSync(templatePath)) {
    fail(`payload settings migration manifest not found at ${templatePath}`, 1);
  }

  const template = JSON.parse(readFileSync(templatePath, "utf8")) as Record<string, unknown>;
  const report = classifyTemplate(template);

  const output: Record<string, unknown> = {
    ok: report.undeclaredTemplateKeys.length === 0,
    tool: "InstallSettings",
    mode: args.apply ? "apply" : "dry-run",
    target: {
      hermesHome: args.hermesHome,
      configPath,
      configExists: existsSync(configPath),
      description: "Hermes configuration file (config.yaml), written via `hermes config set KEY VALUE`",
    },
    source: templatePath,
    operations: report.operations,
    settings: report.settings,
    summary: report.summary,
    undeclaredTemplateKeys: report.undeclaredTemplateKeys,
    unusedRules: report.unusedRules,
    secretsPolicy: SECRETS_POLICY,
  };

  if (report.undeclaredTemplateKeys.length) {
    output.error = "template keys have no declared mapping — the mapping table is behind the payload; nothing was applied";
    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
  }

  if (!args.apply) {
    output.note = "dry run — nothing was written. Re-run with --apply to execute the operations listed above, and only those.";
    console.log(JSON.stringify(output, null, 2));
    process.exit(0);
  }

  const applied = applyOperations(report.operations, { hermesHome: args.hermesHome, configPath });
  output.applied = applied;
  output.ok = applied.ok;
  if (!applied.ok) output.error = `hermes config set ${applied.stoppedAt} failed — remaining operations were not run`;
  console.log(JSON.stringify(output, null, 2));
  process.exit(applied.ok ? 0 : 1);
}

if (import.meta.main) main();

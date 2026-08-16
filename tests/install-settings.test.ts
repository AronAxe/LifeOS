/**
 * Tests for the Hermes configuration adapter.
 *
 * The tool's whole value is that its report is honest, so these tests are
 * mostly about what it refuses to claim: that every shipped template key is
 * accounted for, that unmapped settings produce no operation, that a dry run
 * writes nothing, and that `--apply` runs only the declared operations. The
 * `hermes` CLI is never invoked — apply is exercised through the injected
 * runner seam — and every fixture lives in a temporary directory.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

import {
  applyOperations,
  classifyTemplate,
  configPathFor,
  detectSourceTree,
  MAPPINGS,
  msToSeconds,
  parseArgs,
  resolveHermesHome,
  templateSources,
  toBoolean,
  type ConfigOperation,
  type ConfigRunner,
  type MappingRule,
  type RunResult,
} from "../LifeOS/install/skills/LifeOS/Tools/InstallSettings";

const TOOL = join(import.meta.dir, "..", "LifeOS", "install", "skills", "LifeOS", "Tools", "InstallSettings.ts");
const SHIPPED_TEMPLATE = join(import.meta.dir, "..", "LifeOS", "install", "skills", "LifeOS", "Resources", "settings-migration-manifest.json");

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "lifeos-settings-test-"));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** A skill root holding the real deployed manifest, so classification is real. */
function skillRootWithTemplate(): string {
  const skillRoot = join(root, "skill");
  mkdirSync(join(skillRoot, "Resources"), { recursive: true });
  copyFileSync(SHIPPED_TEMPLATE, join(skillRoot, "Resources", "settings-migration-manifest.json"));
  return skillRoot;
}

function shippedTemplate(): Record<string, unknown> {
  return JSON.parse(readFileSync(SHIPPED_TEMPLATE, "utf-8"));
}

/** Run the tool as a CLI. `bun` is the binary running these tests. */
function runTool(args: string[]) {
  const r = spawnSync(process.execPath, [TOOL, ...args], { encoding: "utf-8" });
  return { code: r.status, json: JSON.parse(r.stdout) as Record<string, any> };
}

describe("target resolution", () => {
  test("an explicit --hermes-home wins over the environment", () => {
    const args = parseArgs(["--hermes-home", "/explicit"], { HERMES_HOME: "/from-env" });
    expect(args.hermesHome).toBe("/explicit");
  });

  test("HERMES_HOME is the default", () => {
    expect(resolveHermesHome(undefined, { HERMES_HOME: "/from-env" })).toBe("/from-env");
  });

  test("falls back to the conventional home when HERMES_HOME is unset or blank", () => {
    const fallback = join(homedir(), ".hermes");
    expect(resolveHermesHome(undefined, {})).toBe(fallback);
    expect(resolveHermesHome(undefined, { HERMES_HOME: "   " })).toBe(fallback);
  });

  test("the target file is config.yaml, never settings.json", () => {
    const path = configPathFor(join(root, "home"));
    expect(path).toBe(join(root, "home", "config.yaml"));
    expect(path).not.toContain("settings.json");
  });

  test("--config-root is retired and refused rather than silently ignored", () => {
    expect(() => parseArgs(["--config-root", "/somewhere"], {})).toThrow(/--config-root is retired/);
  });

  test("the CLI reports the Hermes home and config path it selected", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { code, json } = runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate()]);

    expect(code).toBe(0);
    expect(json.target.hermesHome).toBe(home);
    expect(json.target.configPath).toBe(join(home, "config.yaml"));
    expect(json.target.description).toContain("config.yaml");
  });
});

describe("template classification", () => {
  const template = shippedTemplate();
  const report = classifyTemplate(template);

  test("every top-level key of the shipped template is accounted for", () => {
    expect(report.undeclaredTemplateKeys).toEqual([]);
    for (const key of Object.keys(template)) {
      expect(report.settings.map((s) => s.source)).toContain(key);
    }
  });

  test("every env key of the shipped template is accounted for individually", () => {
    const envKeys = Object.keys(template.env as Record<string, unknown>);
    expect(envKeys.length).toBeGreaterThan(0);
    for (const name of envKeys) {
      expect(report.settings.map((s) => s.source)).toContain(`env.${name}`);
    }
  });

  test("the classified set is exactly the template's own source set", () => {
    expect(report.settings.map((s) => s.source).sort()).toEqual(templateSources(template).sort());
  });

  test("no mapping rule addresses a setting the template does not ship", () => {
    expect(report.unusedRules).toEqual([]);
  });

  test("an unaccounted template key is reported rather than skipped", () => {
    const withNewKey = classifyTemplate({ ...template, someFutureKey: true });
    expect(withNewKey.undeclaredTemplateKeys).toEqual(["someFutureKey"]);
  });

  test("every setting carries a substantive reason", () => {
    for (const s of report.settings) expect(s.reason.length).toBeGreaterThan(20);
  });

  test("every mapped rule names a Hermes key and where its semantics were confirmed", () => {
    const mapped = MAPPINGS.filter((r) => r.classification === "mapped");
    expect(mapped.length).toBeGreaterThan(0);
    for (const rule of mapped) {
      expect(rule.hermesKey).toBeTruthy();
      expect(rule.convert).toBeTypeOf("function");
      expect(rule.verified?.length ?? 0).toBeGreaterThan(20);
    }
  });
});

describe("mapping conversion", () => {
  test("milliseconds convert to whole seconds", () => {
    expect(msToSeconds(600000)).toBe("600");
    expect(msToSeconds("600000")).toBe("600");
    expect(msToSeconds(1500)).toBe("2");
    // A sub-second budget still has to be a legal timeout, not zero.
    expect(msToSeconds(10)).toBe("1");
  });

  test("a non-positive or unparseable duration is not converted", () => {
    for (const bad of [0, -1, "later", null]) expect(() => msToSeconds(bad)).toThrow();
  });

  test("only real booleans convert", () => {
    expect(toBoolean(false)).toBe("false");
    expect(toBoolean(true)).toBe("true");
    for (const bad of ["true", 1, null]) expect(() => toBoolean(bad)).toThrow();
  });

  test("the shipped template yields the two verified operations, converted", () => {
    const { operations } = classifyTemplate(shippedTemplate());
    expect(operations.map((o) => [o.from, o.key, o.value])).toEqual([
      ["env.BASH_DEFAULT_TIMEOUT_MS", "terminal.timeout", "600"],
      ["fileCheckpointingEnabled", "checkpoints.enabled", "false"],
    ]);
    for (const op of operations) {
      expect(op.command).toEqual(["hermes", "config", "set", op.key, op.value]);
    }
  });

  test("a declared mapping that cannot convert this value proposes no operation", () => {
    const report = classifyTemplate({ ...shippedTemplate(), fileCheckpointingEnabled: "yes please" });
    const entry = report.settings.find((s) => s.source === "fileCheckpointingEnabled")!;

    expect(entry.classification).toBe("requires-principal-decision");
    expect(entry.hermesValue).toBeNull();
    expect(entry.reason).toContain("could not convert");
    expect(report.operations.map((o) => o.key)).not.toContain("checkpoints.enabled");
  });
});

describe("unsupported and principal-decision reporting", () => {
  const report = classifyTemplate(shippedTemplate());

  test("every source is classified into exactly one of the three buckets", () => {
    const total = report.summary.mapped + report.summary["requires-principal-decision"] + report.summary.unsupported;
    expect(total).toBe(report.settings.length);
    expect(report.summary.mapped).toBe(report.operations.length);
    expect(report.summary["requires-principal-decision"]).toBeGreaterThan(0);
    expect(report.summary.unsupported).toBeGreaterThan(0);
  });

  test("an unmapped setting yields no Hermes key, no value, and no operation", () => {
    const unmapped = report.settings.filter((s) => s.classification !== "mapped");
    for (const s of unmapped) {
      expect(s.hermesKey).toBeNull();
      expect(s.hermesValue).toBeNull();
    }
    expect(report.operations.every((o) => report.settings.find((s) => s.source === o.from)!.classification === "mapped")).toBe(true);
  });

  test("the settings the task calls out as un-inferable are never claimed as mapped", () => {
    for (const source of [
      "env.API_TIMEOUT_MS",
      "env.PROJECTS_DIR",
      "env.LIFEOS_DIR",
      "env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
      "permissions",
      "autoMode",
      "enabledPlugins",
    ]) {
      const entry = report.settings.find((s) => s.source === source)!;
      expect(entry.classification).not.toBe("mapped");
    }
  });

  test("no operation carries an env value across the secrets boundary", () => {
    const envValues = Object.values(shippedTemplate().env as Record<string, string>);
    for (const op of report.operations) {
      // Env-var-shaped keys are what `hermes config set` routes into .env.
      expect(op.key).not.toMatch(/^[A-Z][A-Z0-9_]*$/);
      expect(envValues).not.toContain(op.value);
    }
  });

  test("the CLI report states the secrets boundary explicitly", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { json } = runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate()]);
    expect(json.secretsPolicy).toContain(".env");
  });
});

describe("dry run", () => {
  test("writes nothing and says so", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { code, json } = runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate()]);

    expect(code).toBe(0);
    expect(json.mode).toBe("dry-run");
    expect(json.note).toContain("nothing was written");
    expect(json.applied).toBeUndefined();
    expect(readdirSync(home)).toEqual([]);
  });

  test("leaves an existing config.yaml byte-identical", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const config = join(home, "config.yaml");
    writeFileSync(config, "model: existing\n");

    runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate()]);

    expect(readFileSync(config, "utf-8")).toBe("model: existing\n");
    expect(readdirSync(home)).toEqual(["config.yaml"]);
  });

  test("a missing template is an error, not an empty report", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { code, json } = runTool(["--hermes-home", home, "--skill-root", join(root, "no-such-skill")]);

    expect(code).toBe(1);
    expect(json.ok).toBe(false);
    expect(json.error).toContain("settings migration manifest");
  });
});

describe("source-tree refusal", () => {
  test("refuses a home carrying the maintainer's private skill plane", () => {
    const home = join(root, "dev-home");
    mkdirSync(join(home, "skills", "_LIFEOS"), { recursive: true });
    expect(detectSourceTree(home)).toContain("_LIFEOS");
  });

  test("refuses a release-payload checkout", () => {
    const home = join(root, "checkout");
    mkdirSync(join(home, "LifeOS", "install", "skills"), { recursive: true });
    expect(detectSourceTree(home)).toContain("source checkout");
  });

  test("accepts an ordinary Hermes home", () => {
    const home = join(root, "hermes-home");
    mkdirSync(join(home, "skills"), { recursive: true });
    expect(detectSourceTree(home)).toBeNull();
  });

  test("the CLI refuses with exit 2 and writes nothing", () => {
    const home = join(root, "dev-home");
    mkdirSync(join(home, "skills", "_LIFEOS"), { recursive: true });
    const { code, json } = runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate()]);

    expect(code).toBe(2);
    expect(json.ok).toBe(false);
    expect(json.error).toContain("refusing");
    expect(existsSync(join(home, "config.yaml"))).toBe(false);
  });

  test("--allow-dev cannot override the refusal", () => {
    const home = join(root, "dev-home");
    mkdirSync(join(home, "skills", "_LIFEOS"), { recursive: true });
    const { code, json } = runTool(["--hermes-home", home, "--skill-root", skillRootWithTemplate(), "--allow-dev"]);

    expect(code).toBe(2);
    expect(json.ok).toBe(false);
    expect(json.error).toContain("not supported");
    expect(existsSync(join(home, "config.yaml"))).toBe(false);
  });
});

describe("apply", () => {
  /** Records what would have been executed. The real CLI is never invoked. */
  function fakeRunner(result: (op: string[]) => RunResult = () => ({ code: 0, stdout: "", stderr: "" })) {
    const calls: Array<{ argv: string[]; hermesHome: string | undefined }> = [];
    const runner: ConfigRunner = (argv, env) => {
      calls.push({ argv, hermesHome: env.HERMES_HOME });
      return result(argv);
    };
    return { runner, calls };
  }

  const operations: ConfigOperation[] = [
    { key: "terminal.timeout", value: "600", from: "env.BASH_DEFAULT_TIMEOUT_MS", verified: "x", command: ["hermes", "config", "set", "terminal.timeout", "600"] },
    { key: "checkpoints.enabled", value: "false", from: "fileCheckpointingEnabled", verified: "x", command: ["hermes", "config", "set", "checkpoints.enabled", "false"] },
  ];

  test("runs each declared operation through the documented CLI with HERMES_HOME set", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { runner, calls } = fakeRunner();

    const report = applyOperations(operations, { hermesHome: home, configPath: configPathFor(home), runner, env: {} });

    expect(report.ok).toBe(true);
    expect(calls.map((c) => c.argv)).toEqual(operations.map((o) => o.command));
    expect(calls.every((c) => c.hermesHome === home)).toBe(true);
  });

  test("snapshots an existing config.yaml before the first command", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const config = configPathFor(home);
    writeFileSync(config, "model: existing\n");

    const { runner } = fakeRunner();
    const report = applyOperations(operations, {
      hermesHome: home,
      configPath: config,
      runner,
      env: {},
      now: new Date("2026-01-02T03:04:05.678Z"),
    });

    expect(report.backup).toBe(`${config}.backup-2026-01-02T03-04-05-678Z`);
    expect(readFileSync(report.backup!, "utf-8")).toBe("model: existing\n");
  });

  test("takes no snapshot when there is no config.yaml to lose", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { runner } = fakeRunner();

    const report = applyOperations(operations, { hermesHome: home, configPath: configPathFor(home), runner, env: {} });

    expect(report.backup).toBeNull();
    expect(readdirSync(home)).toEqual([]);
  });

  test("stops at the first failing command and reports the rest as not run", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { runner, calls } = fakeRunner((argv) =>
      argv.includes("terminal.timeout")
        ? { code: 1, stdout: "", stderr: "unknown key" }
        : { code: 0, stdout: "", stderr: "" },
    );

    const report = applyOperations(operations, { hermesHome: home, configPath: configPathFor(home), runner, env: {} });

    expect(report.ok).toBe(false);
    expect(report.stoppedAt).toBe("terminal.timeout");
    expect(report.executed).toHaveLength(1);
    expect(report.executed[0].stderr).toBe("unknown key");
    expect(calls).toHaveLength(1);
  });

  test("applies only the declared mapped operations, never the classified rest", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    const { runner, calls } = fakeRunner();
    const report = classifyTemplate(shippedTemplate());

    applyOperations(report.operations, { hermesHome: home, configPath: configPathFor(home), runner, env: {} });

    const keysWritten = calls.map((c) => c.argv[3]);
    expect(keysWritten).toEqual(["terminal.timeout", "checkpoints.enabled"]);
    expect(keysWritten).toHaveLength(report.summary.mapped);
  });

  test("an empty operation list touches nothing at all", () => {
    const home = join(root, "hermes-home");
    mkdirSync(home, { recursive: true });
    writeFileSync(configPathFor(home), "model: existing\n");
    const { runner, calls } = fakeRunner();

    const report = applyOperations([], { hermesHome: home, configPath: configPathFor(home), runner, env: {} });

    expect(calls).toEqual([]);
    expect(report.backup).toBeNull();
    expect(readdirSync(home)).toEqual(["config.yaml"]);
  });
});

describe("mapping table integrity", () => {
  test("no source is declared twice", () => {
    const sources = MAPPINGS.map((r: MappingRule) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
  });

  test("only mapped rules carry a Hermes key", () => {
    for (const rule of MAPPINGS.filter((r) => r.classification !== "mapped")) {
      expect(rule.hermesKey).toBeUndefined();
      expect(rule.convert).toBeUndefined();
    }
  });

  test("every Hermes key is dotted lowercase, as the config CLI documents", () => {
    for (const rule of MAPPINGS.filter((r) => r.classification === "mapped")) {
      expect(rule.hermesKey).toMatch(/^[a-z_]+(\.[a-z_]+)+$/);
    }
  });
});

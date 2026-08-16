/**
 * Regression tests for the Hermes skill importer.
 *
 * These cover the three boundaries `ImportSkills.ts` claims to enforce — private
 * (`_ALLCAPS`) exclusion, complete public-skill deployment, and never-overwrite
 * collision handling — plus the documented name-normalization contract. Every
 * test builds its own temporary source and target tree, so nothing here reads or
 * writes a real Hermes home.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  adaptSkillFrontmatterName,
  adaptTextForHermes,
  applyPlan,
  buildPlan,
  formatReport,
  isGeneratedPayloadPath,
  isMaintainerTarget,
  isPrunedPayloadPath,
  normalizeName,
} from "../LifeOS/Tools/ImportSkills";

let root: string;
let src: string;
let target: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "lifeos-import-test-"));
  src = join(root, "skills");
  target = join(root, "hermes-skills");
  mkdirSync(src, { recursive: true });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

/** Create a source skill directory with a SKILL.md of the given body. */
function skill(name: string, body = "# skill\n"): void {
  mkdirSync(join(src, name), { recursive: true });
  writeFileSync(join(src, name, "SKILL.md"), body);
}

/** Create an already-installed target skill (to exercise collision handling). */
function installed(name: string, body = "# skill\n"): void {
  mkdirSync(join(target, name), { recursive: true });
  writeFileSync(join(target, name, "SKILL.md"), body);
}

function plugin(rootDir: string, name = "lifeos"): void {
  mkdirSync(join(rootDir, name), { recursive: true });
  writeFileSync(join(rootDir, name, "plugin.yaml"), `name: ${name}\nversion: "1.0"\n`);
}

function plan(manifest = "") {
  // Every fixture owns its source roots. Tests must never depend on the
  // repository's evolving install payload.
  const manifestPath = join(root, "SKILL_MANIFEST.md");
  writeFileSync(manifestPath, manifest);
  return buildPlan({
    srcSkills: src,
    srcPlugins: join(root, "plugins"),
    skillsDir: target,
    pluginsDir: join(root, "hermes-plugins"),
  });
}

describe("normalizeName", () => {
  // The exact cases the function's own docstring promises.
  test.each([
    ["WorldThreatModel", "world-threat-model"],
    ["ISA", "isa"],
    ["HTML", "html"],
    ["USMetrics", "us-metrics"],
    ["CreateCLI", "create-cli"],
    ["Research", "research"],
  ])("documented case %s → %s", (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });

  // Mixed-case acronyms the generic rule mis-splits (`ar-xiv`, `life-os`).
  test.each([
    ["ArXiv", "arxiv"],
    ["LifeOS", "lifeos"],
    ["CMUX", "cmux"],
    ["CliFirstArchitecture", "cli-first-architecture"],
  ])("acronym override %s → %s", (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });

  test("overrides are case-insensitive on the source directory name", () => {
    expect(normalizeName("ARXIV")).toBe("arxiv");
    expect(normalizeName("arxiv")).toBe("arxiv");
  });

  test("is idempotent", () => {
    for (const name of ["WorldThreatModel", "ArXiv", "ISA", "CreateCLI", "LifeOS"]) {
      const once = normalizeName(name);
      expect(normalizeName(once)).toBe(once);
    }
  });

  test("never emits a leading, trailing, or doubled hyphen", () => {
    for (const name of ["ISA", "USMetrics", "HTML", "ArXiv", "WorldThreatModel"]) {
      const out = normalizeName(name);
      expect(out).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});

describe("deployed compatibility paths", () => {
  test("rewrites upstream Claude paths to deployed Hermes paths without rewriting arbitrary prose", () => {
    const source = [
      "bun ~/.claude/skills/Art/Tools/Generate.ts",
      "read ~/.claude/skills/<optional-skill>/Examples/reference.png",
      "scan ~/.claude/skills/*/SKILL.md",
      "private: ~/.claude/skills/_PRIVATE/Tools/DoNotAdapt.ts",
      `customization: ${["~/.claude", "LIFEOS", "USER", "CUSTOMIZATIONS", "SKILLS", "Art"].join("/")}`,
      `echo '{"ts":"now","skill":"Art"}' >> ${["~/.claude", "LIFEOS", "MEMORY", "SKILLS", "execution.jsonl"].join("/")}`,
      "bun ~/.claude/LIFEOS/TOOLS/Inference.ts",
      `const configRoot = get("--config-root") || process.env.CLAUDE_CONFIG_DIR || process.env.HERMES_HOME ?? join(home, ".hermes");`,
      `const detectedRoot = harness.configRoot || join(home, ".claude");`,
      `{ name: "claude-code", root: process.env.CLAUDE_CONFIG_DIR || process.env.HERMES_HOME ?? join(home, ".hermes"), skills: "skills", bin: "claude" },`,
      "ordinary prose remains unchanged",
    ].join("\n");

    const adapted = adaptTextForHermes(source);

    expect(adapted).toContain("$HERMES_HOME/skills/art/Tools/Generate.ts");
    expect(adapted).toContain("$HERMES_HOME/skills/<optional-skill>/Examples/reference.png");
    expect(adapted).toContain("$HERMES_HOME/skills/*/SKILL.md");
    expect(adapted).toContain("~/.claude/skills/_PRIVATE/Tools/DoNotAdapt.ts");
    expect(adapted).toContain("<LIFEOS_WORKSPACE>/skills/art");
    expect(adapted).not.toContain("$HERMES_HOME/skills/art/PREFERENCES.md");
    expect(adapted).not.toContain("execution.jsonl");
    expect(adapted).toContain("bun ~/.claude/LIFEOS/TOOLS/Inference.ts");
    expect(adapted).toContain('const configRoot = get("--config-root") || (process.env.HERMES_HOME ?? join(home, ".hermes"));');
    expect(adapted).toContain('const detectedRoot = harness.configRoot || (process.env.HERMES_HOME ?? join(home, ".hermes"));');
    expect(adapted).not.toContain('name: "claude-code"');
    expect(adapted).not.toContain("CLAUDE_CONFIG_DIR");
    expect(adapted).toContain("ordinary prose remains unchanged");
  });

  test("rewrites Claude Skill tool calls as Hermes-native installed-skill routing", () => {
    const tool = ["Ski", "ll"].join("");
    const source = [
      `${tool}("ISA", "scaffold from prompt at tier E3")`,
      `invoke ${tool}('Art') for the diagram`,
      `${tool}("WorldThreatModel")`,
    ].join("\n");

    const adapted = adaptTextForHermes(source);

    expect(adapted).not.toContain(`${tool}(`);
    expect(adapted).toContain('the installed `isa` skill with request "scaffold from prompt at tier E3"');
    expect(adapted).toContain("invoke the installed `art` skill for the diagram");
    expect(adapted).toContain("the installed `world-threat-model` skill");
  });

  test("removes legacy voice-daemon preambles without removing workflow content", () => {
    const source = [
      "before mandatory",
      "## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)",
      "",
      "**You MUST send this notification BEFORE doing anything else when this skill is invoked.**",
      "",
      "1. **Send voice notification**:",
      "   ```bash",
      "   curl -s -X POST http://localhost:31337/notify \\\\",
      "     -H \"Content-Type: application/json\"",
      "   ```",
      "",
      "2. **Output text notification**:",
      "   ```",
      "   Running the **Example** workflow in the **Example** skill...",
      "   ```",
      "",
      "**This is not optional. Execute this curl command immediately upon skill invocation.**",
      "",
      "after mandatory",
      "",
      "## Voice Notification",
      "",
      "```bash",
      "curl -s -X POST http://localhost:31337/notify",
      "```",
      "",
      "Running the **RunEval** workflow in the **Evals** skill...",
      "",
      "---",
      "",
      "after simple",
      "",
      "before bounded",
      "## Voice Notification",
      "",
      "**When executing a workflow, do BOTH:**",
      "",
      "1. send it:",
      "```bash",
      "curl -s -X POST http://localhost:31337/notify",
      "```",
      "",
      "2. print it",
      "```",
      "Running the workflow...",
      "```",
      "",
      "## Workflow Routing",
      "after bounded",
    ].join("\n");

    const adapted = adaptTextForHermes(source);

    expect(adapted).not.toContain("localhost:31337");
    expect(adapted).not.toContain("Voice Notification");
    expect(adapted).toContain("before mandatory");
    expect(adapted).toContain("after mandatory");
    expect(adapted).toContain("after simple");
    expect(adapted).toContain("before bounded");
    expect(adapted).toContain("## Workflow Routing\nafter bounded");
  });
});

describe("source-only LifeOS installer boundary", () => {
  test.each([
    ["LifeOS", "install/settings.system.json"],
    ["LifeOS", "Tools/DeployComponents.ts"],
    ["LifeOS", "Tools/DetectEnv.ts"],
    ["LifeOS", "Tools/InstallEngine.ts"],
    ["LifeOS", "Tools/ScanConflicts.ts"],
    ["LifeOS", "Tools/SeedPulse.ts"],
    ["Upgrade", "Tools/Anthropic.ts"],
    ["Telos", "Tools/UpdateTelos.ts"],
    ["ContextSearch", "Tools/ContextSearch.ts"],
    ["Research", "Workflows/research.mjs"],
    ["Research", "Workflows/DeepVerifiedResearch.mjs"],
  ])("omits %s payload %s from deployment", (skill, path) => {
    expect(isPrunedPayloadPath(skill, path)).toBe(true);
  });

  test.each([
    "SKILL.md",
    "Resources/settings-migration-manifest.json",
    "Tools/InstallSettings.ts",
    "Workflows/Setup.md",
  ])("retains supported payload %s", (path) => {
    expect(isPrunedPayloadPath("LifeOS", path)).toBe(false);
  });

  test("does not prune the same relative path from another public skill", () => {
    expect(isPrunedPayloadPath("Example", "install/settings.system.json")).toBe(false);
  });
});

describe("generated payload boundary", () => {
  test.each([
    "Tools/__pycache__",
    "Tools/__pycache__/check.cpython-311.pyc",
    "Tools/check.pyc",
    "Tools/check.pyo",
    "node_modules/dependency/index.js",
    "Dashboard/node_modules/dependency/index.js",
    ".DS_Store",
  ])("excludes local artifact %s", (path) => {
    expect(isGeneratedPayloadPath(path)).toBe(true);
  });

  test.each([
    "Tools/check.py",
    "Resources/ISARender/template.html",
    "dashboard/dist/index.js",
    "Patterns/create_sigma_rules/system.md",
  ])("retains packaged resource %s", (path) => {
    expect(isGeneratedPayloadPath(path)).toBe(false);
  });

  test("apply excludes generated artifacts from skills and plugins while retaining release assets", () => {
    skill("Freshness");
    mkdirSync(join(src, "Freshness", "Tools", "__pycache__"), { recursive: true });
    writeFileSync(join(src, "Freshness", "Tools", "__pycache__", "check.cpython-311.pyc"), "local bytecode");
    mkdirSync(join(src, "Freshness", "node_modules", "dependency"), { recursive: true });
    writeFileSync(join(src, "Freshness", "node_modules", "dependency", "index.js"), "local dependency");
    mkdirSync(join(src, "Freshness", "dist"), { recursive: true });
    writeFileSync(join(src, "Freshness", "dist", "runtime.js"), "release asset");

    const pluginSource = join(root, "plugins");
    const pluginTarget = join(root, "hermes-plugins");
    plugin(pluginSource);
    mkdirSync(join(pluginSource, "lifeos", "__pycache__"), { recursive: true });
    writeFileSync(join(pluginSource, "lifeos", "__pycache__", "tools.cpython-311.pyc"), "local bytecode");
    mkdirSync(join(pluginSource, "lifeos", "dashboard", "dist"), { recursive: true });
    writeFileSync(join(pluginSource, "lifeos", "dashboard", "dist", "index.js"), "release asset");

    const p = buildPlan({ srcSkills: src, srcPlugins: pluginSource, skillsDir: target, pluginsDir: pluginTarget });
    applyPlan(p, target);

    expect(existsSync(join(target, "freshness", "Tools", "__pycache__"))).toBe(false);
    expect(existsSync(join(target, "freshness", "node_modules"))).toBe(false);
    expect(existsSync(join(target, "freshness", "dist", "runtime.js"))).toBe(true);
    expect(existsSync(join(pluginTarget, "lifeos", "__pycache__"))).toBe(false);
    expect(existsSync(join(pluginTarget, "lifeos", "dashboard", "dist", "index.js"))).toBe(true);
  });
});

describe("private (_ALLCAPS) boundary", () => {
  test("private skills are skipped, counted, and never named", () => {
    skill("Algorithm");
    skill("_FIXTURE");
    skill("_ANOTHER_PRIVATE");

    const p = plan();

    expect(p.skippedPrivate).toBe(2);
    expect(p.installed.map((i) => i.to)).not.toContain(expect.stringContaining("fixture"));
    expect(p.installed).toHaveLength(1);

    const text = JSON.stringify(p) + formatReport(p, target, true);
    expect(text).not.toContain("_FIXTURE");
    expect(text).not.toContain("fixture");
    expect(text).not.toContain("_ANOTHER_PRIVATE");
  });

  test("a private skill is skipped even when the manifest lists it as portable", () => {
    skill("_FIXTURE");
    const p = plan("## Portable to Hermes\n\n- **_FIXTURE** — should still be skipped\n");
    expect(p.skippedPrivate).toBe(1);
    expect(p.installed).toHaveLength(0);
  });
});

describe("maintainer target guard", () => {
  test("recognizes the private maintainer marker without inspecting its contents", () => {
    expect(isMaintainerTarget(target)).toBe(false);
    mkdirSync(join(target, "_LIFEOS"), { recursive: true });
    expect(isMaintainerTarget(target)).toBe(true);
  });

  test("CLI honors HERMES_HOME and refuses to import into a maintainer target", () => {
    const fakeHome = join(root, "fake-home");
    const fakeHermes = join(fakeHome, ".hermes");
    const fakeSkills = join(fakeHermes, "skills");
    mkdirSync(join(fakeSkills, "_LIFEOS"), { recursive: true });

    const cliPath = join(__dirname, "..", "LifeOS", "Tools", "ImportSkills.ts");
    const result = spawnSync("bun", [cliPath], {
      env: {
        ...process.env,
        HERMES_HOME: fakeHermes,
        HOME: fakeHome,
        USERPROFILE: fakeHome,
      },
      encoding: "utf-8",
    });

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("refusing to import into a maintainer/source LifeOS skill tree");
    expect(existsSync(join(fakeSkills, ".lifeos-import.json"))).toBe(false);
    expect(readdirSync(fakeSkills)).toEqual(["_LIFEOS"]);
  });
});

describe("public skill deployment", () => {
  test("public skills are never excluded merely because their upstream runtime differed", () => {
    for (const name of ["Art", "Daemon", "Interceptor", "Remotion", "Algorithm"]) skill(name);
    const p = plan();
    expect(p.skippedPlatform).toEqual([]);
    expect(p.installed.map((item) => item.from.split(/[\\/]/).pop()).sort()).toEqual(
      ["Algorithm", "Art", "Daemon", "Interceptor", "Remotion"],
    );
  });

  test("legacy wording in a manifest cannot silently remove a public skill", () => {
    skill("Algorithm");
    skill("Knowledge");
    const p = plan(
      "## Portable to Hermes\n\n- **Algorithm** — yes\n\n" +
        "## Dependency-bound — not ported\n\n- **Knowledge** — needs the undeployed runtime\n",
    );
    expect(p.skippedPlatform).toEqual([]);
    expect(p.installed.map((i) => i.from.split(/[\\/]/).pop()).sort()).toEqual(["Algorithm", "Knowledge"]);
  });
});

describe("runtime plugin deployment", () => {
  test("a native Hermes plugin is planned beside the complete skill body", () => {
    skill("Pulse");
    const pluginSource = join(root, "plugin-source");
    const pluginTarget = join(root, "hermes-plugins");
    plugin(pluginSource);

    const p = buildPlan({ srcSkills: src, srcPlugins: pluginSource, skillsDir: target, pluginsDir: pluginTarget });

    expect(p.installed.map((item) => item.from.split(/[\\/]/).pop())).toEqual(["Pulse"]);
    expect(p.plugins).toEqual([{ from: join(pluginSource, "lifeos"), to: join(pluginTarget, "lifeos") }]);
  });

  test("plugin identity covers the complete payload, not only plugin.yaml", () => {
    const pluginSource = join(root, "plugin-source");
    const pluginTarget = join(root, "hermes-plugins");
    plugin(pluginSource);
    plugin(pluginTarget);
    writeFileSync(join(pluginSource, "lifeos", "tools.py"), "VERSION = 2\n");
    writeFileSync(join(pluginTarget, "lifeos", "tools.py"), "VERSION = 1\n");

    const p = buildPlan({ srcSkills: src, srcPlugins: pluginSource, skillsDir: target, pluginsDir: pluginTarget });

    expect(p.collisionsIdentical).toEqual([]);
    expect(p.collisionsConflict).toEqual(["plugin:lifeos"]);
  });
});

describe("collision semantics", () => {
  test("an identical SKILL.md is reported identical and not rewritten", () => {
    skill("Algorithm", "# same\n");
    installed("algorithm", "# same\n");

    const p = plan();
    expect(p.collisionsIdentical).toEqual(["algorithm"]);
    expect(p.collisionsConflict).toEqual([]);
    expect(p.installed).toHaveLength(0);
  });

  test("an adapted deployed SKILL.md is still reported identical", () => {
    const source = "---\nname: art\n---\nrun ~/.claude/skills/Art/Tools/Generate.ts\n";
    skill("Art", source);
    installed("art", adaptTextForHermes(source));

    const p = plan();

    expect(p.collisionsIdentical).toEqual(["art"]);
    expect(p.installed).toHaveLength(0);
  });

  test("a differing existing skill is preserved while LifeOS installs under its namespace", () => {
    skill("Schema", "# ours\n");
    installed("schema", "# theirs\n");

    const p = plan();
    expect(p.collisionsConflict).toEqual([]);
    expect(p.collisionsIdentical).toEqual([]);
    expect(p.installed).toEqual([{ from: join(src, "Schema"), to: join(target, "lifeos-schema") }]);
    expect(formatReport(p, target, false)).toContain("lifeos-schema");
  });

  test("an existing category directory is preserved while LifeOS installs under its namespace", () => {
    skill("Memory", "---\nname: memory\n---\n# ours\n");
    mkdirSync(join(target, "memory", "second-brain"), { recursive: true });
    writeFileSync(join(target, "memory", "second-brain", "SKILL.md"), "# existing nested skill\n");

    const p = plan();

    expect(p.installed).toEqual([{ from: join(src, "Memory"), to: join(target, "lifeos-memory") }]);
    expect(existsSync(join(target, "memory", "second-brain", "SKILL.md"))).toBe(true);
  });

  test("a namespaced deployment receives a distinct Hermes skill name", () => {
    const source = "---\nname: schema\ndescription: LifeOS schema\n---\n\n# Schema\n";

    expect(adaptSkillFrontmatterName(source, "lifeos-schema")).toBe(
      "---\nname: lifeos-schema\ndescription: LifeOS schema\n---\n\n# Schema\n",
    );
  });

  test("an adapted namespaced deployment is idempotently reported identical", () => {
    const source = `---\nname: schema\n---\nread ${["~/.claude", "LIFEOS", "USER", "schema.md"].join("/")}\n`;
    skill("Schema", source);
    installed("schema", "---\nname: schema\n---\n# native\n");
    installed("lifeos-schema", adaptSkillFrontmatterName(adaptTextForHermes(source), "lifeos-schema"));

    const p = plan();

    expect(p.collisionsIdentical).toEqual(["lifeos-schema"]);
    expect(p.collisionsConflict).toEqual([]);
    expect(p.installed).toHaveLength(0);
  });

  test("collisions are matched on the normalized name, not the source name", () => {
    skill("ArXiv", "# same\n");
    installed("arxiv", "# same\n");
    expect(plan().collisionsIdentical).toEqual(["arxiv"]);
  });
});

describe("plan integrity", () => {
  test("a directory without SKILL.md is invalid, not installed", () => {
    mkdirSync(join(src, "NotASkill"), { recursive: true });
    skill("Algorithm");
    const p = plan();
    expect(p.invalid).toEqual(["NotASkill"]);
    expect(p.installed).toHaveLength(1);
  });

  test("every scanned entry lands in exactly one bucket", () => {
    skill("Algorithm");
    skill("Art");
    skill("_FIXTURE");
    skill("Schema", "# ours\n");
    installed("schema", "# theirs\n");
    mkdirSync(join(src, "NotASkill"), { recursive: true });
    writeFileSync(join(src, "loose-file.md"), "not a directory");

    const p = plan();
    const total =
      p.installed.length +
      p.skippedPrivate +
      p.skippedPlatform.length +
      p.collisionsIdentical.length +
      p.collisionsConflict.length +
      p.invalid.length;
    // 5 directories; the loose file is not a skill and is not counted.
    expect(total).toBe(5);
    expect(formatReport(p, target, true)).toContain(`total scanned: ${total}`);
  });

  test("building a plan mutates nothing on disk (dry-run safety)", () => {
    skill("Algorithm");
    skill("Schema", "# ours\n");
    installed("schema", "# theirs\n");

    const before = readdirSync(target).sort();
    const p = plan();
    formatReport(p, target, true);

    expect(readdirSync(target).sort()).toEqual(before);
    expect(existsSync(join(target, "algorithm"))).toBe(false);
    expect(existsSync(join(target, ".lifeos-import.json"))).toBe(false);
  });
});

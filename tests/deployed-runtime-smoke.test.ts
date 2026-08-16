import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve } from "node:path";

const REPO = join(import.meta.dir, "..");
const IMPORTER = join(REPO, "LifeOS", "Tools", "ImportSkills.ts");
let root = "";
let hermesHome = "";
let importResult: ReturnType<typeof Bun.spawnSync>;

function filesBelow(directory: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...filesBelow(path));
    else result.push(path);
  }
  return result;
}

function resolvesRelativeModule(importer: string, specifier: string): boolean {
  const base = resolve(dirname(importer), specifier);
  const candidates = [base];
  if (!extname(specifier)) {
    for (const suffix of [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"]) candidates.push(`${base}${suffix}`);
    for (const suffix of [".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"]) candidates.push(join(base, `index${suffix}`));
  } else if (specifier.endsWith(".js")) {
    candidates.push(base.slice(0, -3) + ".ts", base.slice(0, -3) + ".tsx");
  }
  return candidates.some(existsSync);
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "halos-deployed-runtime-"));
  hermesHome = join(root, "hermes");
  importResult = Bun.spawnSync({
    cmd: ["bun", IMPORTER],
    cwd: REPO,
    env: { ...process.env, HERMES_HOME: hermesHome, HOME: root, USERPROFILE: root },
    stdout: "pipe",
    stderr: "pipe",
  });
}, 30_000);

afterAll(() => rmSync(root, { recursive: true, force: true }));

describe("deployed runtime smoke", () => {
  test("scratch import succeeds with ISA resources and Hermes scenario tools", () => {
    expect(importResult.exitCode, importResult.stderr.toString()).toBe(0);
    expect(existsSync(join(hermesHome, "skills", "isa", "Resources", "ISARender", "template.html"))).toBe(true);
    expect(existsSync(join(hermesHome, "skills", "isa", "Resources", "ISARender", "template.css"))).toBe(true);
    expect(existsSync(join(hermesHome, "skills", "evals", "Tools", "HermesScenario.ts"))).toBe(true);
    expect(existsSync(join(hermesHome, "skills", "evals", "Tools", "ScenarioRunner.ts"))).toBe(true);
  });

  test("imported ISA renderer produces styled HTML using only skill-relative resources", () => {
    const python = Bun.which("python3") ?? Bun.which("python");
    expect(python).not.toBeNull();
    const fixture = join(root, "ISA.md");
    const output = join(root, "ISA.html");
    writeFileSync(
      fixture,
      [
        "---",
        'task: "Deployment smoke"',
        "slug: deployment-smoke",
        "phase: verify",
        "effort: standard",
        "updated: 2026-08-16",
        'principal_stated_goal: "Verify deployed rendering."',
        "---",
        "",
        "## Goal",
        "Render from the imported skill.",
        "",
        "## Criteria",
        "- [x] ISC-1: Styled output is generated.",
        "",
        "## Verification",
        "Executed from the scratch Hermes home.",
      ].join("\n"),
    );

    const result = Bun.spawnSync({
      cmd: [python!, join(hermesHome, "skills", "isa", "Tools", "render.py"), fixture, "--output", output],
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(result.exitCode, result.stderr.toString()).toBe(0);
    const html = readFileSync(output, "utf8");
    expect(html).toContain("Deployment smoke");
    expect(html).toContain("--ul-bg-base");
    expect(html).toContain("Styled output is generated.");
    expect(html).not.toContain("<style>\n<style>");
    expect(html).not.toContain("{{CSS}}");
  });

  test("imported scenario runner completes through a stub Hermes CLI and writes EvalRun evidence", () => {
    const fakeHermes = join(root, "fake-hermes.ts");
    const workspace = join(root, "eval-workspace");
    writeFileSync(
      fakeHermes,
      [
        'const prompt = process.argv.slice(2).join("\\n");',
        'if (prompt.includes("JUDGE CRITERIA:")) {',
        '  console.log(JSON.stringify({ reasoning: "All criteria met.", results: [',
        '    { criterion: 1, met: true, reason: "polite" },',
        '    { criterion: 2, met: true, reason: "English" },',
        '    { criterion: 3, met: true, reason: "concise" },',
        '  ] }));',
        '} else {',
        '  console.log("Hello. It is good to meet you.");',
        '}',
      ].join("\n"),
    );

    const result = Bun.spawnSync({
      cmd: [
        "bun",
        join(hermesHome, "skills", "evals", "Tools", "ScenarioRunner.ts"),
        "--scenario",
        join(hermesHome, "skills", "evals", "Scenarios", "example-greeting.scenario.ts"),
        "--json",
      ],
      cwd: root,
      env: {
        ...process.env,
        LIFEOS_INFERENCE_APPROVED: "1",
        LIFEOS_EVALS_WORKSPACE: workspace,
        HERMES_INFERENCE_COMMAND_JSON: JSON.stringify([process.execPath, fakeHermes]),
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    expect(result.exitCode, result.stderr.toString()).toBe(0);
    const run = JSON.parse(result.stdout.toString()) as {
      pass_rate: number;
      pass_at_k: number;
      pass_to_k: number;
      trials: Array<{ passed: boolean; transcript: { turns: unknown[] } }>;
      metadata: { source: string };
    };
    expect(run.pass_rate).toBe(1);
    expect(run.pass_at_k).toBe(1);
    expect(run.pass_to_k).toBe(1);
    expect(run.metadata.source).toBe("hermes_scenario");
    expect(run.trials[0].passed).toBe(true);
    expect(run.trials[0].transcript.turns).toHaveLength(2);

    const resultFiles = filesBelow(workspace).filter((path) => path.endsWith("results.json"));
    expect(resultFiles).toHaveLength(1);
    expect(JSON.parse(readFileSync(resultFiles[0], "utf8")).pass_rate).toBe(1);
  });

  test("deployed Evals payload has no retired runtime or provider SDK dependency", () => {
    const evalsRoot = join(hermesHome, "skills", "evals");
    const forbidden = [
      "localhost:31337",
      ["~", "/.claude"].join(""),
      ["LIFEOS", "MEMORY", "STATE", "Evals-Results"].join("/"),
      "@langwatch/scenario",
      "@ai-sdk/anthropic",
      "ANTHROPIC_API_KEY",
    ];
    const hits: string[] = [];
    for (const path of filesBelow(evalsRoot)) {
      if (!/\.(?:md|ts|json|ya?ml)$/i.test(path)) continue;
      const content = readFileSync(path, "utf8");
      for (const marker of forbidden) if (content.includes(marker)) hits.push(`${path}: ${marker}`);
    }
    expect(hits).toEqual([]);
    const manifest = JSON.parse(readFileSync(join(evalsRoot, "package.json"), "utf8"));
    expect(manifest.dependencies ?? {}).toEqual({});
  });

  test("every deployed TypeScript relative import resolves with exact portable casing", () => {
    const unresolved: string[] = [];
    for (const path of filesBelow(join(hermesHome, "skills"))) {
      if (!/\.tsx?$/i.test(path)) continue;
      const content = readFileSync(path, "utf8").replace(/^#![^\n]*(?:\r?\n|$)/, "");
      const transpiler = new Bun.Transpiler({ loader: path.toLowerCase().endsWith(".tsx") ? "tsx" : "ts" });
      let imports: ReturnType<typeof transpiler.scanImports>;
      try {
        imports = transpiler.scanImports(content);
      } catch (error) {
        unresolved.push(`${path}: parse failed: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      for (const imported of imports) {
        if (!imported.path.startsWith(".")) continue;
        if (!resolvesRelativeModule(path, imported.path)) unresolved.push(`${path}: ${imported.path}`);
      }
    }
    expect(unresolved).toEqual([]);
  });
});

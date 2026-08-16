import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const repo = join(import.meta.dir, "..");
const aggregator = join(repo, "LifeOS", "install", "skills", "Daemon", "Tools", "DaemonAggregator.ts");
const publisher = join(repo, "LifeOS", "install", "skills", "Daemon", "Tools", "PublishAdapter.ts");
const scratch: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "lifeos-daemon-"));
  scratch.push(dir);
  return dir;
}

function run(tool: string, args: string[], env: Record<string, string> = {}) {
  return Bun.spawnSync([process.execPath, tool, ...args], {
    cwd: repo,
    env: {
      ...process.env,
      LIFEOS_DIR: "",
      LIFEOS_DAEMON_PUBLIC_PROJECTS: "",
      LIFEOS_DAEMON_PUBLIC_MISSION_IDS: "",
      LIFEOS_DAEMON_PUBLIC_GOAL_IDS: "",
      LIFEOS_DAEMON_PUBLIC_SECTIONS: "",
      LIFEOS_DAEMON_PUBLISH_ADAPTER: "",
      LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS: "",
      ...env,
    },
    stdout: "pipe",
    stderr: "pipe",
  });
}

function parseLastJson(stdout: Uint8Array): Record<string, any> {
  const text = new TextDecoder().decode(stdout);
  const start = text.indexOf("{");
  if (start < 0) throw new Error(`No JSON object in output: ${text}`);
  return JSON.parse(text.slice(start));
}

afterEach(() => {
  while (scratch.length) {
    const path = scratch.pop()!;
    if (existsSync(path)) rmSync(path, { recursive: true, force: true });
  }
});

describe("DaemonAggregator portable configuration", () => {
  test("fails closed when LIFEOS_DIR is not configured", () => {
    const result = run(aggregator, ["--json"]);
    expect(result.exitCode).toBe(2);
    expect(new TextDecoder().decode(result.stderr)).toContain("LIFEOS_DIR");
  });

  test("publishes only explicitly selected source material", () => {
    const root = tempDir();
    mkdirSync(join(root, "USER", "TELOS"), { recursive: true });
    mkdirSync(join(root, "USER", "PROJECTS"), { recursive: true });
    writeFileSync(join(root, "USER", "TELOS", "MISSION.md"), "- M1: approved mission\n- M2: private mission\n");
    writeFileSync(join(root, "USER", "TELOS", "GOALS.md"), "- G1: approved goal\n- G2: private goal\n");
    writeFileSync(join(root, "USER", "TELOS", "BOOKS.md"), "- Approved Book — Author\n");
    writeFileSync(join(root, "USER", "TELOS", "MOVIES.md"), "- Private Movie\n");
    writeFileSync(join(root, "USER", "PRINCIPAL_IDENTITY.md"), "Name: Example Person\nFocus: Building useful systems\n");
    writeFileSync(
      join(root, "USER", "PROJECTS", "PROJECTS.md"),
      "| Project | Status | URL |\n|---|---|---|\n| Approved | active | https://github.com/example/approved |\n| Private | active | https://github.com/example/private |\n",
    );

    const result = run(aggregator, ["--json"], {
      LIFEOS_DIR: root,
      LIFEOS_DAEMON_PUBLIC_MISSION_IDS: "M1",
      LIFEOS_DAEMON_PUBLIC_GOAL_IDS: "G1",
      LIFEOS_DAEMON_PUBLIC_PROJECTS: "Approved",
      LIFEOS_DAEMON_PUBLIC_SECTIONS: "identity,books",
    });
    expect(result.exitCode).toBe(0);
    const output = parseLastJson(result.stdout);

    expect(output.mission).toContain("M1: approved mission");
    expect(output.mission).toContain("G1: approved goal");
    expect(output.mission).not.toContain("M2");
    expect(output.mission).not.toContain("G2");
    expect(output.favorite_books).toEqual(["Approved Book — Author"]);
    expect(output.favorite_movies).toEqual([]);
    expect(output.about).toContain("Building useful systems");
    expect(output.projects.technical.join("\n")).toContain("Approved");
    expect(output.projects.technical.join("\n")).not.toContain("Private");
    expect(output.current_location).toBe("");
  });

  test("an empty publication selection derives no source content", () => {
    const root = tempDir();
    mkdirSync(join(root, "USER", "TELOS"), { recursive: true });
    writeFileSync(join(root, "USER", "TELOS", "MISSION.md"), "- M1: not selected\n");
    writeFileSync(join(root, "USER", "TELOS", "BOOKS.md"), "- Not Selected\n");
    const result = run(aggregator, ["--json"], { LIFEOS_DIR: root });
    expect(result.exitCode).toBe(0);
    const output = parseLastJson(result.stdout);
    expect(output.mission).toBe("");
    expect(output.favorite_books).toEqual([]);
    expect(output.projects).toEqual({ technical: [], creative: [], personal: [] });
  });
});

describe("Daemon publisher adapter", () => {
  test("requires an explicit adapter", () => {
    const root = tempDir();
    const input = join(root, "daemon.md");
    writeFileSync(input, "# profile\n");
    const result = run(publisher, ["--input", input]);
    expect(result.exitCode).toBe(2);
    expect(new TextDecoder().decode(result.stderr)).toContain("LIFEOS_DAEMON_PUBLISH_ADAPTER");
  });

  test("invokes the configured adapter without a shell and forwards dry-run", () => {
    const root = tempDir();
    const input = join(root, "daemon.md");
    const mock = join(root, "mock-publisher.ts");
    writeFileSync(input, "# profile\n");
    writeFileSync(mock, "console.log(JSON.stringify({args: process.argv.slice(2)}));\n");

    const result = run(publisher, ["--input", input, "--dry-run"], {
      LIFEOS_DAEMON_PUBLISH_ADAPTER: process.execPath,
      LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS: JSON.stringify([mock]),
    });
    expect(result.exitCode).toBe(0);
    const output = parseLastJson(result.stdout);
    expect(output.ok).toBe(true);
    expect(output.dryRun).toBe(true);
    const adapterOutput = JSON.parse(output.stdout);
    expect(adapterOutput.args).toContain("--input");
    expect(adapterOutput.args).toContain(input);
    expect(adapterOutput.args).toContain("--dry-run");
  });
});

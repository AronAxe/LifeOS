import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..");
const CMUX = join(REPO, "LifeOS", "install", "skills", "CMUX");
const TOOL = join(CMUX, "Tools", "cmux.ts");

describe("CMUX notification portability", () => {
  test("the CLI contains no retired Pulse endpoint and documents an explicit adapter", () => {
    const source = readFileSync(TOOL, "utf8");
    expect(source).not.toContain("localhost:31337");
    expect(source).toContain("CMUX_NOTIFY_ENDPOINT");
  });

  test("public CMUX guidance does not promise the retired Pulse or voice runtime", () => {
    for (const relative of [
      "SKILL.md",
      "DESIGN.md",
      "ISA.md",
      join("Workflows", "Monitor.md"),
      join("Workflows", "AgentRace.md"),
    ]) {
      const source = readFileSync(join(CMUX, relative), "utf8");
      expect(source).not.toContain("localhost:31337");
      expect(source).not.toContain("POST /notify");
    }

    expect(readFileSync(join(CMUX, "SKILL.md"), "utf8")).toContain("text_to_speech");
    expect(readFileSync(join(CMUX, "Workflows", "Monitor.md"), "utf8")).toContain(
      "prints classified JSON",
    );
  });

  test("voice fails closed without an explicitly configured adapter", () => {
    const env = { ...process.env };
    delete env.CMUX_NOTIFY_ENDPOINT;
    const result = spawnSync("bun", [TOOL, "voice", "test notification"], {
      encoding: "utf8",
      env,
    });

    expect(result.status).toBe(1);
    const payload = JSON.parse(result.stdout.trim());
    expect(payload.ok).toBe(false);
    expect(payload.notified).toBe(false);
    expect(payload.error).toContain("CMUX_NOTIFY_ENDPOINT");
  });
});

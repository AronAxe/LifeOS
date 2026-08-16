import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterContent } from "../LifeOS/install/skills/Daemon/Tools/SecurityFilter";

const REPO = join(import.meta.dir, "..");
const read = (relative: string) => readFileSync(join(REPO, relative), "utf8");

describe("deployed semantic portability", () => {
  test("Fabric describes retired notification behavior without shipping the endpoint", () => {
    const skill = read("LifeOS/install/skills/Fabric/SKILL.md");
    expect(skill).not.toContain("localhost:31337/notify");
    expect(skill).toContain("Hermes TTS");
  });

  test("Apify preserves code-first behavior without hard-coded MCP identifiers", () => {
    const guidance = [
      read("LifeOS/install/skills/Apify/SKILL.md"),
      read("LifeOS/install/skills/Apify/README.md"),
      read("LifeOS/install/skills/Apify/examples/comparison-test.ts"),
    ].join("\n");

    expect(guidance).not.toMatch(/\bmcp__[A-Za-z0-9_]+__[A-Za-z0-9_]+\b/);
    expect(guidance).toContain("apify.search");
    expect(guidance).toContain("apify.callActor");
    expect(guidance).toContain("dataset.listItems");
    expect(guidance).toContain("Filter in code");
  });

  test("historical Pulse literals are absent while Daemon still redacts them", () => {
    const retiredEndpoint = ["localhost", "31337"].join(":");
    const retiredRoot = ["~/.hermes", "halos/hooks/test.ts"].join("/");
    const shipped = [
      read("LifeOS/install/skills/Observability/SKILL.md"),
      read("LifeOS/install/skills/Pulse/SKILL.md"),
      read("LifeOS/install/skills/Daemon/Tools/SecurityFilter.ts"),
    ].join("\n");

    expect(shipped).not.toContain(retiredEndpoint);
    expect(shipped).not.toContain(retiredRoot);
    expect(filterContent(`${retiredEndpoint} pulse server`).passed).toBe(false);
    expect(filterContent(retiredRoot).passed).toBe(false);
  });

  test("the Upgrade example preserves its report schema without Claude-only machinery", () => {
    const report = read("LifeOS/install/skills/Upgrade/References/ExampleReport.md");

    expect(report).not.toMatch(/Claude Code|CLAUDE_SESSION_ID|PreToolUse|skills\/_LIFEOS|Anthropic sources/);
    for (const marker of [
      "## Discoveries",
      "## Recommendations",
      "Prior Status",
      "Evidence",
      "## Skipped Content",
      "## Sources Processed",
    ]) expect(report).toContain(marker);
  });
});

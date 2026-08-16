import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { progressState } from "../LifeOS/install/skills/BrightData/Tools/BrightDataCrawl.ts";

const REPO = join(import.meta.dir, "..");
const SKILL = join(REPO, "LifeOS", "install", "skills", "BrightData");
const TOOL = join(SKILL, "Tools", "BrightDataCrawl.ts");

describe("BrightData Hermes portability", () => {
  test("guidance uses runtime tool discovery rather than hard-coded MCP calls", () => {
    const guidance = [
      readFileSync(join(SKILL, "SKILL.md"), "utf8"),
      readFileSync(join(SKILL, "Workflows", "FourTierScrape.md"), "utf8"),
      readFileSync(join(SKILL, "Workflows", "Crawl.md"), "utf8"),
    ].join("\n");

    expect(guidance).not.toContain("mcp__Brightdata__");
    expect(guidance).toContain("tool_search");
    expect(guidance).toContain("tool_describe");
    expect(guidance).toContain("tool_call");
    expect(guidance).toContain("BrightDataCrawl.ts");
  });

  test("direct API wrapper fails closed when credentials are absent", () => {
    const env = { ...process.env };
    delete env.BRIGHTDATA_API_KEY;
    delete env.BRIGHTDATA_CRAWL_DATASET_ID;

    const result = spawnSync("bun", [TOOL, "start", "--url", "https://example.com"], {
      encoding: "utf8",
      env,
    });

    expect(result.status).toBe(2);
    const payload = JSON.parse(result.stdout.trim());
    expect(payload.ok).toBe(false);
    expect(payload.error).toContain("BRIGHTDATA_API_KEY");
    expect(result.stdout).not.toMatch(/Bearer\s+[A-Za-z0-9_-]+/);
  });

  test("wrapper exposes start, progress, and results without making a request for help", () => {
    const result = spawnSync("bun", [TOOL, "--help"], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("start --url");
    expect(result.stdout).toContain("progress --snapshot");
    expect(result.stdout).toContain("wait --snapshot");
    expect(result.stdout).toContain("results --snapshot");
  });

  test("wait classifies only documented terminal and active states", () => {
    expect(progressState({ status: "starting" })).toBe("starting");
    expect(progressState({ status: "running" })).toBe("running");
    expect(progressState({ status: "ready" })).toBe("ready");
    expect(progressState({ status: "failed" })).toBe("failed");
    expect(progressState({ status: "unexpected" })).toBe("unknown");
    expect(progressState(null)).toBe("unknown");
  });
});

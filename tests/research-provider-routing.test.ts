import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..");
const RESEARCH = join(REPO, "LifeOS", "install", "skills", "Research");
const BRIGHT_DATA = join(REPO, "LifeOS", "install", "skills", "BrightData");
const TOOL = join(RESEARCH, "Tools", "SearchProviders.ts");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("portable research-provider routing", () => {
  test("configured research routes precede specialist scraping", () => {
    const sourceRouting = read(join(RESEARCH, "SourceRoutingProtocol.md"));
    const guidance = [
      read(join(RESEARCH, "SKILL.md")),
      sourceRouting,
      read(join(RESEARCH, "Workflows", "WebScraping.md")),
      read(join(BRIGHT_DATA, "SKILL.md")),
      read(join(BRIGHT_DATA, "Workflows", "FourTierScrape.md")),
    ].join("\n");

    for (const marker of [
      "Exa via Agent Reach",
      "TAVILY_API_KEY",
      "BRAVE_SEARCH_API_KEY",
      "Jina Reader",
      "SearchProviders.ts",
      "Bright Data",
    ]) expect(guidance).toContain(marker);

    expect(sourceRouting.indexOf("Exa via Agent Reach")).toBeLessThan(sourceRouting.toLowerCase().indexOf("specialist retrieval fallback"));
    expect(guidance.toLowerCase()).toContain("specialist retrieval fallback");
    expect(guidance).not.toContain("mcp__Brightdata__");
  });

  test("provider status reports presence without exposing credential values", () => {
    const synthetic = (provider: string) => ["synthetic", provider, "secret"].join("-");
    const exaSecret = synthetic("exa");
    const tavilySecret = synthetic("tavily");
    const braveSecret = synthetic("brave");
    const env = {
      ...process.env,
      EXA_API_KEY: exaSecret,
      TAVILY_API_KEY: tavilySecret,
      BRAVE_SEARCH_API_KEY: braveSecret,
    };
    const result = spawnSync("bun", [TOOL, "status"], { encoding: "utf8", env });

    expect(result.status).toBe(0);
    const payload = JSON.parse(result.stdout.trim());
    expect(payload).toEqual({ exa_api_key: true, tavily: true, brave: true });
    expect(result.stdout).not.toContain(exaSecret);
    expect(result.stdout).not.toContain(tavilySecret);
    expect(result.stdout).not.toContain(braveSecret);
  });

  test("provider requests are pure, bounded, and correctly authenticated", async () => {
    const module = await import("../LifeOS/install/skills/Research/Tools/SearchProviders.ts");
    const tavily = module.buildTavilyRequest("matrix consciousness", "tavily-secret", 7, "news");
    expect(tavily.url).toBe("https://api.tavily.com/search");
    expect(tavily.init.method).toBe("POST");
    expect(tavily.init.headers).toEqual({
      Authorization: "Bearer tavily-secret",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(tavily.init.body))).toEqual({
      query: "matrix consciousness",
      search_depth: "basic",
      max_results: 7,
      topic: "news",
      include_answer: false,
      include_raw_content: false,
    });

    const brave = module.buildBraveRequest("matrix consciousness", "brave-secret", 7, "week");
    expect(brave.url).toContain("https://api.search.brave.com/res/v1/web/search?");
    expect(brave.url).toContain("q=matrix+consciousness");
    expect(brave.url).toContain("count=7");
    expect(brave.url).toContain("freshness=pw");
    expect(brave.init.headers).toEqual({
      Accept: "application/json",
      "X-Subscription-Token": "brave-secret",
    });
  });

  test("help and missing-credential paths make no provider request", () => {
    const help = spawnSync("bun", [TOOL, "--help"], { encoding: "utf8" });
    expect(help.status).toBe(0);
    expect(help.stdout).toContain("search --query");
    expect(help.stdout).toContain("status");
    expect(help.stdout).toContain("/reload");

    const env = { ...process.env };
    delete env.TAVILY_API_KEY;
    delete env.BRAVE_SEARCH_API_KEY;
    const missing = spawnSync("bun", [TOOL, "search", "--query", "test", "--provider", "auto", "--approved"], {
      encoding: "utf8",
      env,
    });
    expect(missing.status).toBe(2);
    expect(JSON.parse(missing.stdout.trim()).error).toContain("No configured provider");
  });
});

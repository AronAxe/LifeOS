import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const REPO = join(import.meta.dir, "..");
const SKILLS = join(REPO, "LifeOS", "install", "skills");

function read(relative: string): string {
  return readFileSync(join(REPO, relative), "utf8");
}

function expectMarkers(relative: string, markers: string[]): void {
  const content = read(relative);
  for (const marker of markers) expect(content, `${relative} must retain ${marker}`).toContain(marker);
}

describe("public capability surface", () => {
  test("all 72 public skill payloads remain present", () => {
    const publicSkills = readdirSync(SKILLS, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !/^_[A-Z0-9_]+$/.test(entry.name))
      .filter((entry) => existsSync(join(SKILLS, entry.name, "SKILL.md")));
    expect(publicSkills).toHaveLength(72);
  });

  test("every public payload has Hermes-loadable frontmatter", () => {
    const publicSkills = readdirSync(SKILLS, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !/^_[A-Z0-9_]+$/.test(entry.name))
      .filter((entry) => existsSync(join(SKILLS, entry.name, "SKILL.md")));

    for (const entry of publicSkills) {
      const relative = `LifeOS/install/skills/${entry.name}/SKILL.md`;
      const content = read(relative);
      expect(content.startsWith("---\n"), `${relative} must start with YAML frontmatter`).toBe(true);
      const close = content.indexOf("\n---\n", 4);
      expect(close, `${relative} must close its YAML frontmatter`).toBeGreaterThan(3);
      const frontmatter = content.slice(4, close);
      expect(frontmatter, `${relative} must declare name`).toMatch(/^name:\s*\S+/m);
      expect(frontmatter, `${relative} must declare description`).toMatch(/^description:\s*(?:[>|]|["']?\S)/m);
      expect(content.slice(close + 5).trim().length, `${relative} must have a body`).toBeGreaterThan(0);
    }
  });

  test("Prompting agent data renders placeholder names as strings", () => {
    const result = Bun.spawnSync({
      cmd: [
        "bun",
        join(SKILLS, "Prompting", "Templates", "Tools", "RenderTemplate.ts"),
        "--template",
        "Primitives/Roster.hbs",
        "--data",
        "Data/Agents.yaml",
        "--preview",
      ],
      cwd: REPO,
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = result.stdout.toString();
    const errors = result.stderr.toString();
    expect(result.exitCode, errors).toBe(0);
    expect(output).not.toContain("[object Object]");
    expect(errors).not.toContain("collection values will be stringified");
  });

  test("Apify retains executable actor, workflow, type, client, and smoke-test resources", () => {
    for (const path of [
      "LifeOS/install/skills/Apify/index.ts",
      "LifeOS/install/skills/Apify/actors/index.ts",
      "LifeOS/install/skills/Apify/actors/web/web-scraper.ts",
      "LifeOS/install/skills/Apify/actors/business/google-maps.ts",
      "LifeOS/install/skills/Apify/actors/social-media/instagram.ts",
      "LifeOS/install/skills/Apify/types/common.ts",
      "LifeOS/install/skills/Apify/examples/smoke-test.ts",
      "LifeOS/install/skills/Apify/Workflows/Update.md",
    ]) expect(existsSync(join(REPO, path)), path).toBe(true);
    expectMarkers("LifeOS/install/skills/Apify/SKILL.md", [
      "actors/index.ts",
      "Filter, project, sort, and deduplicate in code",
      "dataset count",
      "cost uncertainty",
    ]);
  });
});

describe("CreateSkill domain method", () => {
  test("the active router exposes the complete create-update-improve lifecycle", () => {
    expectMarkers("LifeOS/install/skills/CreateSkill/SKILL.md", [
      "Workflows/CreateSkill.md",
      "Workflows/UpdateSkill.md",
      "Workflows/ImproveSkill.md",
      "Workflows/ValidateSkill.md",
      "Workflows/TestSkill.md",
    ]);
  });

  test("description optimization retains positive, negative, and comparative evaluation", () => {
    expectMarkers("LifeOS/install/skills/CreateSkill/Workflows/OptimizeDescription.md", [
      "should-trigger",
      "should-not-trigger",
      "true positive",
      "false negative",
      "baseline:",
      "candidate:",
    ]);
  });

  test("testing and canonicalization retain executable evidence and capability parity", () => {
    expectMarkers("LifeOS/install/skills/CreateSkill/Workflows/TestSkill.md", [
      "happy path",
      "with skill",
      "baseline",
      "Evidence:",
      "untested",
    ]);
    expectMarkers("LifeOS/install/skills/CreateSkill/Workflows/CanonicalizeSkill.md", [
      "capability ledger",
      "preserve:",
      "replace:",
      "optional adapter",
      "full repository gate",
    ]);
    expectMarkers("LifeOS/install/skills/CreateSkill/Workflows/ValidateSkill.md", [
      "Routing checks",
      "Capability-honesty checks",
      "Safety checks",
      "Execution checks",
      "PASS WITH LIMITATIONS",
    ]);
  });
});

describe("Research domain method", () => {
  test("deep investigations retain iterative state and evidence schemas", () => {
    expectMarkers("LifeOS/install/skills/Research/Workflows/DeepInvestigation.md", [
      "landscape.md",
      "source-ledger.json",
      "entities.json",
      "Deep profile",
      "Verification pass",
      "Loop gate",
    ]);
  });

  test("retrieval, alpha extraction, scraping, trends, and video remain routed", () => {
    expectMarkers("LifeOS/install/skills/Research/SKILL.md", [
      "Workflows/Retrieve.md",
      "Workflows/ExtractAlpha.md",
      "Workflows/DeepInvestigation.md",
      "Workflows/AnalyzeAiTrends.md",
      "Workflows/WebScraping.md",
      "Workflows/YoutubeExtraction.md",
    ]);
    expectMarkers("LifeOS/install/skills/Research/Workflows/ExtractAlpha.md", [
      "consensus_or_baseline",
      "alternative_explanations",
      "disconfirming_evidence",
      "decision_implication",
    ]);
    expectMarkers("LifeOS/install/skills/Research/Workflows/WebScraping.md", [
      "source_url",
      "page_or_cursor",
      "deduplicate in code",
      "requested versus collected count",
    ]);
  });

  test("legacy request classes remain routed through portable workflows", () => {
    expectMarkers("LifeOS/install/skills/Research/SKILL.md", [
      "Workflows/QuickResearch.md",
      "Workflows/StandardResearch.md",
      "Workflows/ExtensiveResearch.md",
      "Workflows/DeepVerifiedResearch.md",
      "Workflows/InterviewResearch.md",
      "Workflows/Verify.md",
      "Workflows/Enhance.md",
      "Workflows/ExtractKnowledge.md",
      "Workflows/Fabric.md",
    ]);
    expectMarkers("LifeOS/install/skills/Research/Workflows/DeepVerifiedResearch.md", [
      "falsifiable claim",
      "direct quotation",
      "quote-support",
      "contradiction",
      "source-strength",
      "all-abstain",
    ]);
  });

  test("deployed research guidance does not expose unsupported provider-agent or Claude command syntax", () => {
    const deployedGuidance = [
      "LifeOS/install/skills/Research/SKILL.md",
      "LifeOS/install/skills/Research/QuickReference.md",
      "LifeOS/install/skills/Research/SourceRoutingProtocol.md",
      "LifeOS/install/skills/Research/UrlVerificationProtocol.md",
      "LifeOS/install/skills/Research/Workflows/ClaudeResearch.md",
      "LifeOS/install/skills/Research/Workflows/QuickResearch.md",
      "LifeOS/install/skills/Research/Workflows/StandardResearch.md",
      "LifeOS/install/skills/Research/Workflows/ExtensiveResearch.md",
      "LifeOS/install/skills/Research/Workflows/InterviewResearch.md",
      "LifeOS/install/skills/Research/Workflows/Verify.md",
    ].map(read).join("\n");

    expect(deployedGuidance).not.toMatch(/\b(?:Claude|Gemini|Grok|Perplexity)Researcher\b/);
    expect(deployedGuidance).not.toMatch(/\bsubagent_type\s*:|\bTask\s*\(\s*\{/);
    expect(deployedGuidance).not.toContain("/conduct-research");
    expect(deployedGuidance).not.toContain("credentials already in env");
    expect(deployedGuidance).not.toMatch(/~\/\.claude/);
  });
});

describe("Hermes-native delegation surface", () => {
  test("Council and Aphorisms use delegate_task rather than provider-specific agents", () => {
    const files = [
      "LifeOS/install/skills/Council/SKILL.md",
      "LifeOS/install/skills/Council/CouncilMembers.md",
      "LifeOS/install/skills/Council/Workflows/Debate.md",
      "LifeOS/install/skills/Council/Workflows/Quick.md",
      "LifeOS/install/skills/Aphorisms/Workflows/ResearchThinker.md",
    ];
    const content = files.map(read).join("\n");

    expect(content).toContain("delegate_task");
    expect(content).not.toMatch(/\b(?:Claude|Gemini|Grok|Perplexity)Researcher\b/);
    expect(content).not.toMatch(/\bsubagent_type\s*:/);
    expect(content).not.toContain("localhost:31337");
  });
});

describe("Upgrade domain method", () => {
  test("the active router exposes each specialized upgrade workflow", () => {
    expectMarkers("LifeOS/install/skills/Upgrade/SKILL.md", [
      "Workflows/Upgrade.md",
      "Workflows/FindSources.md",
      "Workflows/MineReflections.md",
      "Workflows/ResearchUpgrade.md",
      "Workflows/AlgorithmUpgrade.md",
    ]);
  });

  test("source discovery and reflection mining retain ranked evidence", () => {
    expectMarkers("LifeOS/install/skills/Upgrade/Workflows/FindSources.md", [
      "authority/primary-source proximity",
      "Representative item",
      "Recommendation: add | trial | watch manually | reject",
    ]);
    expectMarkers("LifeOS/install/skills/Upgrade/Workflows/MineReflections.md", [
      "execution-pattern failures",
      "Prior status",
      "Smallest correction",
      "Verification:",
    ]);
  });

  test("research and algorithm upgrades retain decision schemas and gates", () => {
    expectMarkers("LifeOS/install/skills/Upgrade/Workflows/ResearchUpgrade.md", [
      "Current external capability",
      "Local compatibility",
      "Smallest implementation",
      "Decisive verification",
    ]);
    expectMarkers("LifeOS/install/skills/Upgrade/Workflows/AlgorithmUpgrade.md", [
      "section heat map",
      "Observed gap: absence | noncompliance | implementation defect | unclear rule",
      "version impact",
      "Do not self-modify automatically",
    ]);
  });
});

describe("TELOS report capability", () => {
  test("the workflow preserves typed evidence, report structure, regeneration, and build verification", () => {
    expectMarkers("LifeOS/install/skills/Telos/Workflows/WriteReport.md", [
      "source manifest",
      "findings.json",
      "recommendations.json",
      "roadmap.json",
      "methodology.json",
      "ReportData",
      "production build",
      "Regeneration and change control",
    ]);
    expect(existsSync(join(REPO, "LifeOS/install/skills/Telos/ReportTemplate/lib/report-data.ts"))).toBe(true);
    expect(existsSync(join(REPO, "LifeOS/install/skills/Telos/ReportTemplate/package.json"))).toBe(true);
  });
});

describe("foundational workflows remain functional after compression", () => {
  test("Knowledge retains explicit ingest and idea-development behavior", () => {
    expectMarkers("LifeOS/install/skills/Knowledge/SKILL.md", [
      "Ingest a source",
      "Develop an existing idea",
      "Contradiction review",
      "Optional cognitive-graph route",
      "Completion standard",
    ]);
  });

  test("Algorithm, ContextSearch, Interview, BackgroundServices, and Migrate retain their portable cores", () => {
    expectMarkers("LifeOS/install/skills/Algorithm/SKILL.md", ["OBSERVE", "THINK", "PLAN", "BUILD", "EXECUTE", "VERIFY", "LEARN"]);
    expectMarkers("LifeOS/install/skills/ContextSearch/SKILL.md", ["session_search", "lcm_recall", "Resume behavior"]);
    expectMarkers("LifeOS/install/skills/Interview/SKILL.md", ["Read existing context before asking questions", "one salient item at a time", "approved"]);
    expectMarkers("LifeOS/install/skills/BackgroundServices/SKILL.md", ["creates **zero scheduled jobs**", "cronjob(action=\"list\")", "rollback"]);
    expectMarkers("LifeOS/install/skills/Migrate/SKILL.md", ["source receipt", "consent", "read back"]);
  });
});

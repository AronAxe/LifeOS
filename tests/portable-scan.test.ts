/**
 * Tests for the portable-release scan.
 *
 * These prove the scan actually catches each regression class it claims to, and
 * that its scoping and allowlist behave — including that a stale allowlist entry
 * is itself a failure, so exemptions cannot silently accumulate.
 */
import { describe, expect, test } from "bun:test";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  ALLOWLIST,
  effectivePortableContent,
  isLegacyPath,
  repositoryFiles,
  RULES,
  scanFiles,
  type AllowEntry,
} from "../LifeOS/Tools/PortableScan";

const rules = (id: string) => RULES.filter((r) => r.id === id);

function scan(path: string, content: string, allowlist: AllowEntry[] = []) {
  return scanFiles([{ path, content }], allowlist);
}

describe("private-path rule", () => {
  test.each([
    "TELOS source: E:/Dropbox/SOME PERSON/TELOS/",
    "path = 'D:\\\\Data\\\\telos'",
    "cd /Users/someone/.config",
    "cd /home/someone/notes",
  ])("flags %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("private-path")).violations)
      .not.toHaveLength(0);
  });

  test.each([
    "set TELOS_DIR to ${TELOS_DIR}",
    "for example: run the check",
    "use <TELOS_DIR>/GOALS.md",
    "C:/<your-path>/TELOS",
    "cd /Users/<you>/notes",
  ])("does not flag %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("private-path")).violations)
      .toHaveLength(0);
  });
});

describe("principal-id rule", () => {
  test("flags a literal person in the document_id namespace", () => {
    const v = scanFiles(
      [{ path: "a.md", content: "document_id: user:jdoe:conduit:daily:2026-08-10" }],
      [],
      rules("principal-id"),
    ).violations;
    expect(v).toHaveLength(1);
    expect(v[0].match).toBe("user:jdoe:");
  });

  test.each([
    "document_id: user:{id}:conduit:daily:{date}",
    "document_id: user:{user_id}:synapse:{capture_id}",
    "document_id: user:<id>:telos",
    'f"user:{principal_id}:conduit:daily:{date}"',
  ])("does not flag the placeholder form %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("principal-id")).violations)
      .toHaveLength(0);
  });
});

describe("principal-name rule", () => {
  test("flags the maintainer's name used as an identity literal", () => {
    expect(
      scanFiles([{ path: "a.md", content: "the Aron-model cognitive graph" }], [], rules("principal-name"))
        .violations,
    ).toHaveLength(1);
  });

  test.each(["Aaron Swartz", "Shaaron Ainsworth", "Paronomasia (Pun)"])(
    "does not flag %s",
    (line) => {
      expect(scanFiles([{ path: "a.md", content: line }], [], rules("principal-name")).violations)
        .toHaveLength(0);
    },
  );
});

describe("claude-runtime rule", () => {
  test.each([
    "bun ~/.claude/LIFEOS/TOOLS/Services.ts status",
    "$HOME/.claude/hooks/Safety.hook.ts",
    "%USERPROFILE%\\.claude\\skills",
    "const root = path.join(os.homedir(), '.claude/LIFEOS/USER/TELOS')",
    "const config = join(home, \".claude\")",
    "const root = resolve(process.env.USERPROFILE || \"\", \".CLAUDE\", \"LIFEOS\")",
    "const skills = join(HOME, '.Claude', 'skills')",
    "const tool = `${homeDir}/.claude/LIFEOS/TOOLS/Inference.ts`",
    "const root = resolve(\n  process.env.HOME!,\n  '.claude/LIFEOS/Aesthetic.md'\n)",
  ])("flags %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("claude-runtime")).violations)
      .not.toHaveLength(0);
  });

  test.each([
    "bun $HERMES_HOME/skills/cmux/Tools/cmux.ts",
    "read Examples/canonical-isa.md",
    "${TELOS_DIR}/GOALS.md",
  ])("does not flag the sanctioned form %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("claude-runtime")).violations)
      .toHaveLength(0);
  });
});

describe("claude-tool-api rule", () => {
  const tool = ["Ski", "ll"].join("");
  const invocation = `${tool}("ISA", "scaffold the project")`;

  test("flags an unsupported Claude Skill tool invocation", () => {
    expect(scanFiles([{ path: "a.md", content: invocation }], [], rules("claude-tool-api")).violations)
      .toHaveLength(1);
  });

  test("the public-skill deployment transform preserves the request without the unsupported syntax", () => {
    const path = "LifeOS/install/skills/Example/Workflows/Run.md";
    const adapted = effectivePortableContent(path, invocation);
    expect(adapted).toContain('the installed `isa` skill with request "scaffold the project"');
    expect(scanFiles([{ path, content: adapted }], [], rules("claude-tool-api")).violations)
      .toHaveLength(0);
  });
});

describe("claude-agent-api rule", () => {
  const agent = ["Ag", "ent"].join("");
  const invocation = `${agent}(subagent_type="general-purpose", prompt="review")`;

  test("flags unsupported Claude Agent delegation syntax", () => {
    expect(scanFiles([{ path: "a.md", content: invocation }], [], rules("claude-agent-api")).violations)
      .toHaveLength(1);
  });

  test("accepts Hermes delegate_task routing", () => {
    expect(scanFiles([{ path: "a.md", content: 'delegate_task(goal="review")' }], [], rules("claude-agent-api")).violations)
      .toHaveLength(0);
  });
});

describe("claude-content-tool-api rule", () => {
  const unsupportedCalls = [
    ["Web", "Search"].join("") + '("query")',
    ["Web", "Fetch"].join("") + '(url, "extract")',
    ["Re", "ad"].join("") + '("image.png")',
    ["Ed", "it"].join("") + '(file_path="a.md")',
  ];

  test("flags unsupported Claude content-tool call syntax", () => {
    for (const content of unsupportedCalls) {
      expect(scanFiles([{ path: "a.md", content }], [], rules("claude-content-tool-api")).violations)
        .toHaveLength(1);
    }
  });

  test("accepts corresponding Hermes tool syntax", () => {
    const content = [
      'web_search(query="query")',
      'web_extract(urls=[url])',
      'vision_analyze(image_url="image.png")',
      'patch(path="a.md", old_string="a", new_string="b")',
    ].join("\n");
    expect(scanFiles([{ path: "a.md", content }], [], rules("claude-content-tool-api")).violations)
      .toHaveLength(0);
  });
});

describe("external-claude-cli rule", () => {
  const command = ["clau", "de --version"].join("");

  test("requires a narrow documented exemption for an external Claude CLI adapter", () => {
    const files = [{ path: "adapter.md", content: command }];
    expect(scanFiles(files, [], rules("external-claude-cli")).violations).toHaveLength(1);
    expect(scanFiles(files, [{ file: "adapter.md", rule: "external-claude-cli", reason: "optional external adapter" }], rules("external-claude-cli")).violations)
      .toHaveLength(0);
  });
});

describe("effective deployed payload", () => {
  /**
   * A public skill reference the importer rewrites at deploy time. Scanned
   * literally it is a violation, which is what makes it a usable probe: the
   * only way a scan of this text can come back clean is post-adaptation.
   */
  const claudeReference = "bun ~/.claude/skills/Example/Tools/Run.ts status";

  const scanEffective = (path: string, content: string) =>
    scanFiles([{ path, content: effectivePortableContent(path, content) }], [], rules("claude-runtime"))
      .violations;

  test("the probe text is a genuine violation when scanned literally", () => {
    expect(scanFiles([{ path: "a.md", content: claudeReference }], [], rules("claude-runtime")).violations)
      .not.toHaveLength(0);
  });

  test("scans a public skill payload after the adaptation, not before it", () => {
    const path = "LifeOS/install/skills/Example/Tools/run.ts";

    expect(effectivePortableContent(path, claudeReference)).toBe("bun $HERMES_HOME/skills/example/Tools/Run.ts status");
    expect(scanEffective(path, claudeReference)).toHaveLength(0);
  });

  test("leaves an unported global LifeOS tool visible to the release gate", () => {
    const path = "LifeOS/install/skills/Example/Tools/run.ts";
    const unsupported = "bun ~/.claude/LIFEOS/TOOLS/Run.ts status";
    expect(effectivePortableContent(path, unsupported)).toBe(unsupported);
    expect(scanEffective(path, unsupported)).not.toHaveLength(0);
  });

  test("detects a Claude path assembled at runtime inside a public payload", () => {
    const path = "LifeOS/install/skills/Example/lib/config.ts";
    const unsupported = "const root = path.join(os.homedir(), '.claude/LIFEOS/USER/TELOS')";
    expect(effectivePortableContent(path, unsupported)).toBe(unsupported);
    expect(scanEffective(path, unsupported)).not.toHaveLength(0);
  });

  test("models source-only nested installer files as absent from deployment", () => {
    const path = "LifeOS/install/skills/LifeOS/install/settings.system.json";
    expect(effectivePortableContent(path, claudeReference)).toBe("");
    expect(scanEffective(path, claudeReference)).toHaveLength(0);
  });

  test.each([
    "README.md",
    "HERMES.md",
    "LifeOS/Tools/DeployComponents.ts",
    "LifeOS/install/HERMES.md",
    "LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md",
    "LifeOS/install/plugins/example/plugin.json",
    "PORT_SCHEMAS/hook_mapping.md",
  ])("leaves %s literal, so its Claude reference is still detected", (path) => {
    expect(effectivePortableContent(path, claudeReference)).toBe(claudeReference);
    expect(scanEffective(path, claudeReference)).not.toHaveLength(0);
  });

  test("does not extend the adaptation to private _ALLCAPS skills", () => {
    const path = "LifeOS/install/skills/_PRIVATE/Tools/run.ts";
    expect(effectivePortableContent(path, claudeReference)).toBe(claudeReference);
    expect(isLegacyPath(path, new Set())).toBe(true);
  });

  test("adapts every file within a public skill, not just its SKILL.md", () => {
    for (const path of [
      "LifeOS/install/skills/Example/SKILL.md",
      "LifeOS/install/skills/Example/Workflows/Run.md",
      "LifeOS/install/skills/Example/examples/demo.ts",
    ]) {
      expect(scanEffective(path, claudeReference)).toHaveLength(0);
    }
    // A file directly under skills/ is not inside a payload — nothing to adapt.
    expect(effectivePortableContent("LifeOS/install/skills/CLAUDE.md", claudeReference))
      .toBe(claudeReference);
  });
});

describe("undeployed-runtime rule", () => {
  test.each([
    "$HERMES_HOME/LIFEOS/TOOLS/Services.ts",
    "$HERMES_HOME/halos/TOOLS/Services.ts",
    "$HERMES_HOME/tools/llcli/llcli.ts",
    "$HERMES_HOME/customizations/skills/example/PREFERENCES.md",
    "$HERMES_HOME/telemetry/skill-execution.jsonl",
    "LIFEOS/USER/CUSTOMIZATIONS/SKILLS/example/PREFERENCES.md",
    "LIFEOS/MEMORY/STATE/capabilities.json",
  ])("flags retired runtime root %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("undeployed-runtime")).violations)
      .not.toHaveLength(0);
  });

  test.each([
    "$HERMES_HOME/skills/conduit/Tools/rollup.py",
    "$HERMES_HOME/config.yaml",
    "$HERMES_HOME/.env",
    "<LIFEOS_WORKSPACE>/skills/example/PREFERENCES.md",
    "<LIFEOS_DIR>/USER/TELOS/TELOS.md",
  ])("does not flag documented Hermes path %s", (line) => {
    expect(scanFiles([{ path: "a.md", content: line }], [], rules("undeployed-runtime")).violations)
      .toHaveLength(0);
  });
});

describe("credential rule", () => {
  test("flags an assigned secret", () => {
    expect(
      scanFiles(
        [{ path: "a.md", content: 'api_key = "abcdef0123456789abcdef"' }],
        [],
        rules("credential"),
      ).violations,
    ).toHaveLength(1);
  });

  test("does not flag a documented placeholder", () => {
    expect(
      scanFiles(
        [{ path: "a.md", content: "api_key = <YOUR_API_KEY_GOES_HERE_XX>" }],
        [],
        rules("credential"),
      ).violations,
    ).toHaveLength(0);
  });
});

describe("scope", () => {
  test.each([
    "LifeOS/install/LIFEOS/PULSE/pulse.ts",
    "LifeOS/install/hooks/Safety.hook.ts",
    "LifeOS/install/USER/TELOS/GOALS.md",
    "LifeOS/install/install.sh",
    "LifeOS/install/skills/_PRIVATE/SKILL.md",
  ])("%s is retained legacy and out of scope", (path) => {
    expect(isLegacyPath(path)).toBe(true);
  });

  test.each([
    "LifeOS/Tools/ImportSkills.ts",
    "LifeOS/Workflows/HermesSetup.md",
    "LifeOS/install/skills/Algorithm/SKILL.md",
    "LifeOS/install/skills/Knowledge/SKILL.md",
    "LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md",
    "PORT_SCHEMAS/hook_mapping.md",
    "README.md",
  ])("%s is on the portable surface", (path) => {
    expect(isLegacyPath(path)).toBe(false);
  });

  test("repository enumeration includes untracked, non-ignored release files", () => {
    const fixtureName = `portable-scan-untracked-${process.pid}.md`;
    const fixture = join(import.meta.dir, "..", fixtureName);
    writeFileSync(fixture, "temporary scanner enumeration fixture\n");
    try {
      expect(repositoryFiles()).toContain(fixtureName);
    } finally {
      rmSync(fixture, { force: true });
    }
  });
});

describe("allowlist", () => {
  const entry: AllowEntry = {
    file: "doc.md",
    rule: "claude-runtime",
    reason: "explanatory material",
  };

  test("suppresses the exempted rule for the exempted file only", () => {
    const body = "see ~/.claude/LIFEOS/TOOLS/x.ts";
    expect(scan("doc.md", body, [entry]).violations).toHaveLength(0);
    expect(scan("other.md", body, [entry]).violations).not.toHaveLength(0);
  });

  test("does not suppress other rules in the exempted file", () => {
    const result = scan("doc.md", "user:jdoe:telos and ~/.claude/x", [entry]);
    expect(result.violations.map((v) => v.rule)).toEqual(["principal-id"]);
  });

  test("an entry that matches nothing is reported as stale", () => {
    expect(scan("doc.md", "nothing to see", [entry]).staleAllowlist).toEqual([entry]);
    expect(scan("doc.md", "see ~/.claude/x", [entry]).staleAllowlist).toEqual([]);
  });

  test("every shipped allowlist entry documents a reason", () => {
    for (const e of ALLOWLIST) {
      expect(e.reason.length).toBeGreaterThan(20);
      expect(RULES.map((r) => r.id)).toContain(e.rule);
    }
  });
});

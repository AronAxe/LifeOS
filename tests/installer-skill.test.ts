import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { repositoryFiles } from "../LifeOS/Tools/PortableScan";

const ROOT = join(import.meta.dir, "..", "LifeOS", "SKILL.md");
const DEPLOYED = join(import.meta.dir, "..", "LifeOS", "install", "skills", "LifeOS", "SKILL.md");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

for (const [label, path] of [
  ["release bootstrap skill", ROOT],
  ["deployed lifecycle skill", DEPLOYED],
] as const) {
  test(`${label} is a Hermes-loadable, consent-gated installer`, () => {
    const content = read(path);

    expect(content.startsWith("---\n")).toBe(true);
    expect(content).toContain("name: LifeOS");
    expect(content).toContain("# HALOS Bootstrap Installer");
    expect(content).toContain("Tools/ImportSkills.ts");
    expect(content).toContain("--dry-run");
    expect(content).toContain("HERMES_HOME");
    expect(content).toContain("hermes plugins enable lifeos");
    expect(content).toContain("InstallSettings.ts");
    expect(content).toContain("terminal.timeout");
    expect(content).toContain("checkpoints.enabled");
    expect(content).toContain("explicit approval");
    expect(content).toContain("hermes config check");
    expect(content).toContain("not automatically inject");
  });
}

test("release bootstrap skill rejects an incomplete package instead of improvising", () => {
  const content = read(ROOT);
  expect(content).toContain("complete release checkout");
  expect(content).toContain("do not improvise an importer");
  expect(content).toContain("install/plugins/lifeos/plugin.yaml");
});

test("the native plugin dashboard entry is present on the release surface", () => {
  const entry = "LifeOS/install/plugins/lifeos/dashboard/dist/index.js";
  expect(existsSync(join(import.meta.dir, "..", entry))).toBe(true);
  expect(repositoryFiles()).toContain(entry);
});

test("portable doctrine does not claim uninstalled context, memory, or cron machinery", () => {
  const repo = join(import.meta.dir, "..");
  const constitution = read(join(repo, "LifeOS", "install", "LIFEOS", "HERMES_CONSTITUTION.md"));
  const memory = read(join(repo, "LifeOS", "install", "skills", "Memory", "SKILL.md"));
  const schema = read(join(repo, "PORT_SCHEMAS", "hindsight_memory_schema.md"));
  const hooks = read(join(repo, "PORT_SCHEMAS", "hook_mapping.md"));

  expect(constitution).toContain("purpose: portable-reference-doctrine");
  expect(constitution).not.toContain("purpose: ephemeral-system-prompt");
  expect(memory).not.toContain("MemoryManager.prefetch_all()");
  expect(memory).not.toContain("MemoryManager.sync_all()");
  expect(schema).not.toContain("### Configured (this port)");
  expect(schema).toContain("importer does not edit `config.yaml`");
  expect(hooks).toContain("No HALOS constitution/TELOS injection");
  expect(hooks).toContain("installer creates zero jobs");
});

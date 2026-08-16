#!/usr/bin/env bun
/**
 * PublishAdapter — invoke an explicitly configured daemon publisher without a shell.
 *
 * The publisher contract is intentionally small:
 *   <adapter> [...configured args] --input <absolute daemon.md> [--dry-run]
 *
 * Configuration:
 *   LIFEOS_DAEMON_PUBLISH_ADAPTER       Absolute executable path (required)
 *   LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS  Optional JSON array of fixed arguments
 */
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

function fail(message: string, code = 2): never {
  console.error(message);
  process.exit(code);
}

function valueAfter(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function configuredArgs(): string[] {
  const raw = process.env.LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS?.trim();
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail("LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS must be a JSON array of strings.");
  }
  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
    fail("LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS must be a JSON array of strings.");
  }
  return parsed;
}

const inputArg = valueAfter("--input");
if (!inputArg) fail("Usage: bun PublishAdapter.ts --input <daemon.md> [--dry-run]");
const input = resolve(inputArg);
if (!existsSync(input)) fail(`Daemon input does not exist: ${input}`);

const adapter = process.env.LIFEOS_DAEMON_PUBLISH_ADAPTER?.trim();
if (!adapter) fail("LIFEOS_DAEMON_PUBLISH_ADAPTER is required for publication.");
if (!isAbsolute(adapter)) fail("LIFEOS_DAEMON_PUBLISH_ADAPTER must be an absolute executable path.");
if (!existsSync(adapter)) fail(`Publish adapter does not exist: ${adapter}`);

const command = [adapter, ...configuredArgs(), "--input", input];
if (process.argv.includes("--dry-run")) command.push("--dry-run");

const child = Bun.spawn(command, {
  stdin: "ignore",
  stdout: "pipe",
  stderr: "pipe",
  env: process.env,
});
const [exitCode, stdout, stderr] = await Promise.all([
  child.exited,
  new Response(child.stdout).text(),
  new Response(child.stderr).text(),
]);

console.log(JSON.stringify({
  ok: exitCode === 0,
  exitCode,
  adapter,
  input,
  dryRun: process.argv.includes("--dry-run"),
  stdout,
  stderr,
}, null, 2));
process.exit(exitCode);

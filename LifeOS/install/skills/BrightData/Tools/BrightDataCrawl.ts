#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const API_BASE = "https://api.brightdata.com";
const RESULT_FORMATS = new Set(["json", "ndjson", "jsonl", "csv"]);

type FlagValue = string | true;
type ParsedArgs = { command: string; flags: Record<string, FlagValue> };
type JsonRecord = Record<string, unknown>;

class CliError extends Error {
  constructor(message: string, readonly exitCode = 2) {
    super(message);
  }
}

function usage(): string {
  return `BrightDataCrawl.ts - fail-closed Bright Data Crawl API wrapper

USAGE:
  bun BrightDataCrawl.ts start --url <https-url> [--depth 3] [--filter <regex>] --approved
  bun BrightDataCrawl.ts progress --snapshot <snapshot-id>
  bun BrightDataCrawl.ts wait --snapshot <snapshot-id> [--interval 10] [--timeout 900]
  bun BrightDataCrawl.ts results --snapshot <snapshot-id> [--format json|ndjson|jsonl|csv] [--out <path>]

ENVIRONMENT:
  BRIGHTDATA_API_KEY             Required for every API request
  BRIGHTDATA_CRAWL_DATASET_ID    Required for start; the configured Crawl API dataset

SAFETY:
  start refuses to initiate a chargeable collection unless --approved is present.
  Credentials are read from the environment and are never printed.
`;
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? "";
  const flags: Record<string, FlagValue> = {};
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new CliError(`Unexpected positional argument: ${token}`);
    }
    const name = token.slice(2);
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags[name] = next;
      index += 1;
    } else {
      flags[name] = true;
    }
  }
  return { command, flags };
}

function flagString(args: ParsedArgs, name: string): string | undefined {
  const value = args.flags[name];
  return typeof value === "string" ? value : undefined;
}

function requireFlag(args: ParsedArgs, name: string): string {
  const value = flagString(args, name)?.trim();
  if (!value) throw new CliError(`Missing required --${name}`);
  return value;
}

function apiKey(): string {
  const value = process.env.BRIGHTDATA_API_KEY?.trim();
  if (!value) throw new CliError("BRIGHTDATA_API_KEY is required");
  return value;
}

function datasetId(): string {
  const value = process.env.BRIGHTDATA_CRAWL_DATASET_ID?.trim();
  if (!value) throw new CliError("BRIGHTDATA_CRAWL_DATASET_ID is required for start");
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new CliError("BRIGHTDATA_CRAWL_DATASET_ID contains unsupported characters");
  }
  return value;
}

function validatedUrl(raw: string): string {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new CliError("--url must be an absolute HTTP(S) URL");
  }
  if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.username || parsed.password) {
    throw new CliError("--url must be an absolute HTTP(S) URL without embedded credentials");
  }
  return parsed.toString();
}

function validatedSnapshot(raw: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(raw)) {
    throw new CliError("--snapshot contains unsupported characters");
  }
  return raw;
}

function depthValue(raw: string | undefined): number {
  const depth = raw === undefined ? 3 : Number.parseInt(raw, 10);
  if (!Number.isInteger(depth) || depth < 0 || depth > 20) {
    throw new CliError("--depth must be an integer from 0 through 20");
  }
  return depth;
}

function secondsValue(raw: string | undefined, fallback: number, name: string, maximum: number): number {
  const seconds = raw === undefined ? fallback : Number.parseInt(raw, 10);
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > maximum) {
    throw new CliError(`--${name} must be an integer from 1 through ${maximum}`);
  }
  return seconds;
}

export function progressState(value: unknown): "starting" | "running" | "ready" | "failed" | "unknown" {
  if (typeof value !== "object" || value === null || !("status" in value)) return "unknown";
  const status = String((value as JsonRecord).status).toLowerCase();
  if (status === "starting" || status === "running" || status === "ready" || status === "failed") return status;
  return "unknown";
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function remoteError(status: number, body: string): CliError {
  const parsed = parseJson(body);
  const detail =
    typeof parsed === "object" && parsed !== null && "error" in parsed
      ? String((parsed as JsonRecord).error)
      : body.slice(0, 500) || `HTTP ${status}`;
  return new CliError(`Bright Data API returned HTTP ${status}: ${detail}`, 1);
}

async function request(path: string, method = "GET", body?: unknown): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw remoteError(response.status, await response.text());
  }
  return response;
}

async function start(args: ParsedArgs): Promise<JsonRecord> {
  apiKey();
  const dataset = datasetId();
  if (args.flags.approved !== true) {
    throw new CliError("Refusing chargeable collection: pass --approved after principal cost approval");
  }

  const url = validatedUrl(requireFlag(args, "url"));
  const depth = depthValue(flagString(args, "depth"));
  const filter = flagString(args, "filter");
  const query = new URLSearchParams({ dataset_id: dataset, format: "json", include_errors: "true" });
  const payload: JsonRecord = { url, crawl_depth: depth, format: "markdown" };
  if (filter?.trim()) payload.url_filter = filter.trim();

  const response = await request(`/datasets/v3/trigger?${query.toString()}`, "POST", [payload]);
  const data = parseJson(await response.text());
  const snapshot =
    typeof data === "object" && data !== null && "snapshot_id" in data
      ? String((data as JsonRecord).snapshot_id)
      : typeof data === "string"
        ? data
        : "";
  if (!snapshot) throw new CliError("Bright Data trigger response did not contain snapshot_id", 1);
  return { ok: true, snapshot_id: snapshot, dataset_id: dataset };
}

async function readProgress(snapshot: string): Promise<unknown> {
  const response = await request(`/datasets/v3/progress/${encodeURIComponent(snapshot)}`);
  return parseJson(await response.text());
}

async function progress(args: ParsedArgs): Promise<JsonRecord> {
  const snapshot = validatedSnapshot(requireFlag(args, "snapshot"));
  return { ok: true, snapshot_id: snapshot, progress: await readProgress(snapshot) };
}

async function waitForReady(args: ParsedArgs): Promise<JsonRecord> {
  const snapshot = validatedSnapshot(requireFlag(args, "snapshot"));
  const intervalSeconds = secondsValue(flagString(args, "interval"), 10, "interval", 300);
  const timeoutSeconds = secondsValue(flagString(args, "timeout"), 900, "timeout", 86_400);
  const deadline = Date.now() + timeoutSeconds * 1_000;
  let checks = 0;

  while (true) {
    const current = await readProgress(snapshot);
    checks += 1;
    const status = progressState(current);
    if (status === "ready") return { ok: true, snapshot_id: snapshot, status, checks, progress: current };
    if (status === "failed") throw new CliError(`Bright Data crawl ${snapshot} failed`, 1);
    if (status === "unknown") throw new CliError("Bright Data progress response contained an unknown status", 1);

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new CliError(`Timed out after ${timeoutSeconds} seconds waiting for Bright Data crawl ${snapshot}`, 1);
    }
    await Bun.sleep(Math.min(intervalSeconds * 1_000, remainingMs));
  }
}

async function results(args: ParsedArgs): Promise<JsonRecord> {
  const snapshot = validatedSnapshot(requireFlag(args, "snapshot"));
  const format = flagString(args, "format") ?? "json";
  if (!RESULT_FORMATS.has(format)) {
    throw new CliError("--format must be json, ndjson, jsonl, or csv");
  }

  const query = new URLSearchParams({ format });
  const response = await request(`/datasets/v3/snapshot/${encodeURIComponent(snapshot)}?${query.toString()}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const outputPath = flagString(args, "out");
  if (outputPath) {
    const target = resolve(outputPath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
    return { ok: true, snapshot_id: snapshot, format, output: target, bytes: bytes.byteLength };
  }

  const text = new TextDecoder().decode(bytes);
  return { ok: true, snapshot_id: snapshot, format, results: format === "json" ? parseJson(text) : text };
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    process.stdout.write(usage());
    return 0;
  }

  try {
    const args = parseArgs(argv);
    let output: JsonRecord;
    if (args.command === "start") output = await start(args);
    else if (args.command === "progress") output = await progress(args);
    else if (args.command === "wait") output = await waitForReady(args);
    else if (args.command === "results") output = await results(args);
    else throw new CliError(`Unknown command: ${args.command}`);
    process.stdout.write(`${JSON.stringify(output)}\n`);
    return 0;
  } catch (error) {
    const known = error instanceof CliError ? error : new CliError(error instanceof Error ? error.message : String(error), 1);
    process.stdout.write(`${JSON.stringify({ ok: false, error: known.message })}\n`);
    return known.exitCode;
  }
}

if (import.meta.main) process.exit(await main());

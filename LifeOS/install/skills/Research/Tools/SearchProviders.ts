#!/usr/bin/env bun

const TAVILY_URL = "https://api.tavily.com/search";
const BRAVE_URL = "https://api.search.brave.com/res/v1/web/search";
const PROVIDERS = new Set(["auto", "tavily", "brave"]);
const TOPICS = new Set(["general", "news", "finance"]);
const FRESHNESS = new Map([
  ["day", "pd"],
  ["week", "pw"],
  ["month", "pm"],
  ["year", "py"],
]);

type Provider = "auto" | "tavily" | "brave";
type FlagValue = string | true;
type ParsedArgs = { command: string; flags: Record<string, FlagValue> };
type JsonRecord = Record<string, unknown>;
export type ProviderRequest = { url: string; init: RequestInit };

class CliError extends Error {
  constructor(message: string, readonly exitCode = 2) {
    super(message);
  }
}

function usage(): string {
  return `SearchProviders.ts - optional Tavily and Brave Search adapter

USAGE:
  bun SearchProviders.ts status
  bun SearchProviders.ts search --query <text> [--provider auto|tavily|brave]
      [--max-results 5] [--topic general|news|finance]
      [--freshness day|week|month|year] --approved

ENVIRONMENT:
  EXA_API_KEY            Reported for inventory; Exa execution uses Agent Reach/MCP
  TAVILY_API_KEY         Enables Tavily Search
  BRAVE_SEARCH_API_KEY   Enables Brave Search
  After adding keys to the Hermes .env, run /reload or begin a new session so
  terminal subprocesses inherit the updated environment.

ROUTING:
  auto prefers Tavily when configured, then Brave. Exa via Agent Reach and
  Hermes-native web_search remain separate routes and should be considered first.

SAFETY:
  status and help never make network requests. Search requires --approved because
  configured providers may consume account quota. Credential values are never printed.
`;
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? "";
  const flags: Record<string, FlagValue> = {};
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new CliError(`Unexpected positional argument: ${token}`);
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

function boundedQuery(raw: string): string {
  const query = raw.trim();
  if (!query) throw new CliError("--query cannot be empty");
  if (query.length > 2_000) throw new CliError("--query cannot exceed 2000 characters");
  return query;
}

function boundedResults(raw: string | undefined): number {
  const count = raw === undefined ? 5 : Number.parseInt(raw, 10);
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    throw new CliError("--max-results must be an integer from 1 through 20");
  }
  return count;
}

function selectedProvider(raw: string | undefined): Provider {
  const provider = (raw ?? "auto").toLowerCase();
  if (!PROVIDERS.has(provider)) throw new CliError("--provider must be auto, tavily, or brave");
  return provider as Provider;
}

function selectedTopic(raw: string | undefined): string {
  const topic = (raw ?? "general").toLowerCase();
  if (!TOPICS.has(topic)) throw new CliError("--topic must be general, news, or finance");
  return topic;
}

function selectedFreshness(raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  const freshness = FRESHNESS.get(raw.toLowerCase());
  if (!freshness) throw new CliError("--freshness must be day, week, month, or year");
  return freshness;
}

function key(name: "EXA_API_KEY" | "TAVILY_API_KEY" | "BRAVE_SEARCH_API_KEY"): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function buildTavilyRequest(
  query: string,
  apiKey: string,
  maxResults = 5,
  topic = "general",
): ProviderRequest {
  return {
    url: TAVILY_URL,
    init: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        search_depth: "basic",
        max_results: maxResults,
        topic,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(30_000),
    },
  };
}

export function buildBraveRequest(
  query: string,
  apiKey: string,
  maxResults = 5,
  freshness?: string,
): ProviderRequest {
  const url = new URL(BRAVE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("count", String(maxResults));
  if (freshness) url.searchParams.set("freshness", FRESHNESS.get(freshness) ?? freshness);
  return {
    url: url.toString(),
    init: {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(30_000),
    },
  };
}

function configured(): { exa_api_key: boolean; tavily: boolean; brave: boolean } {
  return {
    exa_api_key: Boolean(key("EXA_API_KEY")),
    tavily: Boolean(key("TAVILY_API_KEY")),
    brave: Boolean(key("BRAVE_SEARCH_API_KEY")),
  };
}

function resolveProvider(requested: Provider): "tavily" | "brave" {
  const available = configured();
  if (requested === "tavily") {
    if (!available.tavily) throw new CliError("TAVILY_API_KEY is required for provider tavily");
    return "tavily";
  }
  if (requested === "brave") {
    if (!available.brave) throw new CliError("BRAVE_SEARCH_API_KEY is required for provider brave");
    return "brave";
  }
  if (available.tavily) return "tavily";
  if (available.brave) return "brave";
  throw new CliError("No configured provider: set TAVILY_API_KEY or BRAVE_SEARCH_API_KEY");
}

async function requestJson(provider: string, request: ProviderRequest): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(request.url, request.init);
  } catch (error) {
    throw new CliError(`${provider} request failed: ${error instanceof Error ? error.message : String(error)}`, 1);
  }
  const text = await response.text();
  if (!response.ok) {
    throw new CliError(`${provider} returned HTTP ${response.status}; inspect account quota and provider status`, 1);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new CliError(`${provider} returned a non-JSON response`, 1);
  }
}

async function search(args: ParsedArgs): Promise<JsonRecord> {
  if (args.flags.approved !== true) {
    throw new CliError("Refusing provider request: pass --approved after quota/cost approval");
  }
  const query = boundedQuery(requireFlag(args, "query"));
  const maxResults = boundedResults(flagString(args, "max-results"));
  const provider = resolveProvider(selectedProvider(flagString(args, "provider")));
  const request = provider === "tavily"
    ? buildTavilyRequest(query, key("TAVILY_API_KEY")!, maxResults, selectedTopic(flagString(args, "topic")))
    : buildBraveRequest(query, key("BRAVE_SEARCH_API_KEY")!, maxResults, selectedFreshness(flagString(args, "freshness")));
  return { ok: true, provider, response: await requestJson(provider, request) };
}

async function main(argv = process.argv.slice(2)): Promise<number> {
  if (argv.length === 0 || argv[0] === "--help" || argv[0] === "-h" || argv[0] === "help") {
    process.stdout.write(usage());
    return 0;
  }
  try {
    const args = parseArgs(argv);
    if (args.command === "status") {
      process.stdout.write(`${JSON.stringify(configured())}\n`);
      return 0;
    }
    if (args.command !== "search") throw new CliError(`Unknown command: ${args.command}`);
    process.stdout.write(`${JSON.stringify(await search(args))}\n`);
    return 0;
  } catch (error) {
    const known = error instanceof CliError ? error : new CliError(error instanceof Error ? error.message : String(error), 1);
    process.stdout.write(`${JSON.stringify({ ok: false, error: known.message })}\n`);
    return known.exitCode;
  }
}

if (import.meta.main) process.exit(await main());

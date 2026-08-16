---
name: BrightData
version: 2.0.0
description: "Optional last-resort web retrieval and crawl adapter for authorized public content when Hermes-native extraction, Exa/Jina retrieval, and browser automation cannot return the required corpus. Never the default research provider."
effort: medium
portable: true
---

# Bright Data — Optional Specialist Retrieval

Bright Data is a commercial proxy, scraper, and crawl platform. In HALOS it is a **specialist retrieval fallback**, not a general search engine and not a prerequisite for Research.

Use the existing research routes first:

1. `web_search` and `web_extract`.
2. **Exa via Agent Reach** for semantic discovery or full-page retrieval.
3. **Jina Reader** for a known public URL.
4. `Tools/SearchProviders.ts` in the Research skill when `TAVILY_API_KEY` or `BRAVE_SEARCH_API_KEY` is configured and quota/cost approval exists.
5. `browser_exec` for public pages requiring JavaScript or bounded interaction.
6. Bright Data only when those routes fail, an explicitly requested crawl needs its infrastructure, or a supported Bright Data tool is the appropriate authorized adapter.

Bright Data does not confer permission to bypass logins, paywalls, CAPTCHAs, robots rules, or access controls.

## Runtime capability discovery

Do not hard-code an MCP server or tool name. Search the current Hermes tool registry:

1. `tool_search(query="Bright Data scrape crawl web page markdown")`
2. `tool_describe(name="<returned-tool-name>")`
3. `tool_call(name="<returned-tool-name>", arguments={...})`

If no compatible tool is present, report it as unavailable or use the direct crawl wrapper below when configured. Never invent a tool name from upstream documentation.

## Direct Crawl API wrapper

`Tools/BrightDataCrawl.ts` provides a fail-closed, environment-driven path to Bright Data's asynchronous Crawl API:

```bash
bun Tools/BrightDataCrawl.ts --help
bun Tools/BrightDataCrawl.ts start --url <https-url> [--depth 3] [--filter <regex>] --approved
bun Tools/BrightDataCrawl.ts wait --snapshot <snapshot-id> [--interval 10] [--timeout 900]
bun Tools/BrightDataCrawl.ts results --snapshot <snapshot-id> [--format json|ndjson|jsonl|csv] [--out <path>]
```

Required environment variables:

- `BRIGHTDATA_API_KEY` for API requests.
- `BRIGHTDATA_CRAWL_DATASET_ID` for initiating a crawl.

The wrapper never prints either value. Starting a collection requires `--approved`; approval must account for the current provider plan and requested scope.

## Workflows

| Workflow | Use |
|---|---|
| `Workflows/FourTierScrape.md` | Retrieve one public page through progressive, evidence-preserving routes. |
| `Workflows/Crawl.md` | Collect a bounded multi-page public corpus or initiate an approved Bright Data crawl. |

## Completion standard

Return the retrieved artifact, exact route used, source URLs, page/record count, failed URLs, access limitations, and provider-reported usage when available. A tool invocation, snapshot ID, or HTTP 200 without verified content is not completion.

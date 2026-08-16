# Bounded Crawl Workflow

Crawl a public site or section while preserving URL provenance, scope, and exact completion counts. Use ordinary Hermes retrieval for bounded crawls; reserve Bright Data's asynchronous Crawl API for an explicitly approved specialist run.

## 1. Define the contract

Before collection, record:

- starting URL and allowed domain;
- path filter or URL regex;
- depth and maximum page count;
- required fields and output format;
- deduplication rule;
- access constraints and stop condition;
- whether any provider quota/cost has been approved.

If “crawl” has no scope, obtain the page/depth boundary before initiating a paid or unbounded operation.

## 2. Choose the route

### Bounded agent crawl

Use for a small, explicit page set. Fetch the starting page through `FourTierScrape.md`, extract same-domain links, normalize and deduplicate them, then retrieve pages in batches using the first working route:

1. `web_extract`;
2. Exa `web_fetch_exa` or Jina Reader for known public URLs;
3. `browser_exec` when rendering is required;
4. a configured source-specific adapter.

Append each batch to workspace JSON/CSV. Stop at the declared count/depth, access boundary, or repeated rate limiting. Do not silently switch to a paid scraper.

### Bright Data crawl

Use only when Bright Data is configured, the scope justifies it, and the principal has approved the provider run.

Prefer a compatible deferred tool when one exists:

1. `tool_search(query="Bright Data crawl website")`
2. `tool_describe(name="<returned-tool-name>")`
3. `tool_call(name="<returned-tool-name>", arguments={...})`

Otherwise use the fail-closed direct wrapper:

```bash
bun Tools/BrightDataCrawl.ts start \
  --url <https-url> \
  --depth <0-20> \
  --filter <regex> \
  --approved
```

The command requires `BRIGHTDATA_API_KEY` and `BRIGHTDATA_CRAWL_DATASET_ID` and returns a `snapshot_id`. It does not imply completion.

Monitor and retrieve:

```bash
bun Tools/BrightDataCrawl.ts wait --snapshot <snapshot-id> --interval 10 --timeout 900
bun Tools/BrightDataCrawl.ts results --snapshot <snapshot-id> --format json --out <workspace-path>
```

Use the provider account's current usage information for any cost statement. Do not preserve stale fixed-price claims in the workflow.

## 3. Incremental record schema

Every page record retains:

```text
source_url, final_url, retrieved_at, depth, parent_url, route,
status, content_path_or_text, validation_notes
```

Normalize fragments and trailing slashes, handle query parameters according to scope, and reject links outside the approved domain/path boundary.

## 4. Verify

- compare requested, discovered, attempted, succeeded, failed, and deduplicated counts;
- inspect representative first/middle/last pages;
- detect block/error pages returned as HTTP 200;
- confirm cursor/queue advancement and stop condition;
- verify saved artifact readability and schema;
- list failed URLs and partial coverage explicitly.

## 5. Deliver

Return the artifact path, site map or URL ledger, exact counts, route(s), scope, deduplication method, failures, access limitations, and provider-reported usage when available. A snapshot ID is progress evidence, not the deliverable.

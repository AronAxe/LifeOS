# Web Scraping Workflow

Use the least invasive route that returns reliable, auditable evidence.

## 1. Define the extraction contract

Record target URLs/domain, records and fields, pagination boundary, time window, maximum count, deduplication key, output format, access constraints, and stop condition. Inspect terms, robots/access controls, privacy implications, and expected paid-provider cost.

## 2. Escalate progressively

1. `web_extract` for public static pages and PDFs.
2. Exa `web_fetch_exa` or Jina Reader for a known public URL when ordinary extraction is incomplete. SearchProviders is for discovery, not proof that a page was retrieved.
3. `browser_exec` for JavaScript rendering, pagination, or bounded interaction.
4. A configured source-specific actor/adapter when the requested data shape requires it.
5. Bright Data only as a specialist retrieval fallback for an explicitly approved proxy/crawl after prior routes fail. Discover an available deferred integration with `tool_search` → `tool_describe` → `tool_call`, or use `BrightData/Tools/BrightDataCrawl.ts` when its credential and dataset are configured.

Do not bypass login walls, CAPTCHA, paywalls, or access controls. A provider may solve ordinary rendering or blocking, but it does not authorize circumvention. Stop when credentials or unapproved cost are required.

## 3. Extract incrementally

For multi-page work, append each batch to workspace JSON/CSV rather than holding the corpus in conversation context. Every row should retain:

```text
source_url, retrieved_at, record_id, page_or_cursor, extraction_status,
requested_fields..., validation_notes
```

Normalize types, preserve raw locators, deduplicate in code, and checkpoint counts after each batch.

## 4. Validate

- inspect representative first/middle/last records;
- verify pagination or cursor advancement;
- compare requested versus collected count;
- detect blocked/error pages masquerading as HTTP 200;
- check duplicates, missing fields, impossible values, and schema drift;
- re-open a sample of source pages.

## 5. Deliver

Return the verified artifact, row count, field schema, deduplication method, source coverage, failures, and access limitations. A parser returning success or an actor run ID is not completion when records and totals can be checked.

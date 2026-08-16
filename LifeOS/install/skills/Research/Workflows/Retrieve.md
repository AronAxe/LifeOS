# Retrieve Workflow

Retrieve the requested source or prior artifact through the least expensive reliable route, escalating only when the previous route cannot supply verified evidence.

## 1. Resolve the target

Parse the artifact, claim, entity, topic, source type, time range, jurisdiction, and desired output. A user-supplied URL, repository, file, thread, or identifier is the primary source: inspect it before searching for substitutes.

## 2. Route by source

1. **Local/prior work:** use file tools, `session_search`, or LCM retrieval.
2. **Public static page/PDF:** discover with `web_search` and extract with `web_extract`.
3. **Dynamic/paginated page:** use `browser_exec` and save batches incrementally.
4. **Specialized source:** use an installed academic, GitHub, YouTube, social, or structured-data skill.
5. **Optional scraper/adapter:** use only when configured, permitted, and cost-approved.

Do not bypass authentication, CAPTCHA, paywalls, or access controls. A blocked direct source remains blocked; an unrelated mirror is not automatically equivalent.

## 3. Search and verify

Use exact phrases, distinctive entities, site/domain constraints, and date terms. Broaden with synonyms only when recall is poor. Open every candidate used in the answer; snippets prove discovery, not content. Prefer canonical originals over mirrors and deduplicate syndicated copies.

For each accepted source record:

```text
source_id: stable local ID
url_or_path: canonical locator
title: observed title
publisher: owner/author
published_at: date or unknown
retrieved_at: current timestamp
source_type: primary | secondary | dataset | session | file
supports: exact claim/artifact requested
locator: page, section, timestamp, line, or record ID
access_notes: paywall, truncation, OCR, dynamic content, or none
```

## 4. Handle failures

- Empty search: reformulate terms and search a different evidence channel.
- Extraction failure: retry the canonical URL through the browser route.
- Partial/OCR output: identify missing pages or regions and inspect them separately.
- Conflicting versions: preserve both dates and identify which is authoritative.
- Inaccessible evidence: report the limitation; do not reconstruct missing text.

## 5. Deliver

Return the artifact or answer with precise locators, canonical links, and inaccessible portions. For multi-source work, save a deduplicated source ledger in the task workspace. Retrieval is complete only when the returned evidence has been opened and matched to the request.

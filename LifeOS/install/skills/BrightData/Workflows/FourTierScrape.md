# Four-Tier Public-Page Retrieval

**Deliverable:** readable content from the requested public URL, with the successful route and any access limitation recorded. Begin with the least invasive route and escalate only after a concrete failure.

This workflow retrieves known URLs. For discovery, use Research first: `web_search`, Exa via Agent Reach, or the configured Tavily/Brave adapter. Bright Data is not a search engine.

## Tier 1 — Hermes direct extraction

Use `web_extract` for the URL. For a server that advertises Markdown for Agents, a bounded pre-check is also acceptable:

```bash
curl -sSL -H "Accept: text/markdown" "<url>"
```

Accept the result only if it contains the requested page rather than a block page, error shell, or unrelated redirect.

## Tier 2 — Existing retrieval channels

For a known public URL, use one healthy route:

- Exa via Agent Reach: `mcporter call exa.web_fetch_exa --args '{"urls":["<url>"]}' --output json`
- Jina Reader: retrieve `https://r.jina.ai/http://...` or `https://r.jina.ai/https://...` for the exact target URL.

Do not send authenticated, private, or sensitive URLs through third-party retrieval providers without explicit context-egress approval.

## Tier 3 — Browser rendering

Use `browser_exec` for a public page that requires JavaScript, pagination, or bounded interaction. Stop at login, payment, permission, or CAPTCHA boundaries. Preserve the final URL and verify that the extracted text matches the requested page.

## Tier 4 — Optional Bright Data adapter

Use this tier only after prior routes fail or when the principal explicitly requests Bright Data and approves provider usage.

Discover a compatible runtime tool rather than assuming its name:

1. `tool_search(query="Bright Data scrape page markdown")`
2. `tool_describe(name="<returned-tool-name>")`
3. `tool_call(name="<returned-tool-name>", arguments={...})`

If no compatible deferred tool is installed, a configured Crawl API dataset can retrieve one URL with `Tools/BrightDataCrawl.ts` at depth `0` after approval. Otherwise return `unavailable`; do not fabricate a provider integration.

## Verification and output

Verify the title/topic, major sections, source URL, and absence of block/error content. Return:

```text
URL: <final-url>
Route: web_extract | Exa | Jina | browser_exec | Bright Data
Status: complete | partial | unavailable
Limitations: <none or exact limitation>
Artifact: <content or saved path>
```

A provider's success response is not proof that the requested page was retrieved correctly.

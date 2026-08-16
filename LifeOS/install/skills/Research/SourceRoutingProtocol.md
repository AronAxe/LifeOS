# Source Routing Protocol

Use the source that actually contains the evidence. Tool choice follows source choice; it does not replace it.

## Classify the question first

- **Published fact or analysis:** official sites, documentation, papers, filings, standards, reputable reporting.
- **Community sentiment:** the actual forum, social platform, review corpus, or comment thread where people spoke.
- **Code or product state:** official repository, release notes, issue tracker, documentation, or live product.
- **Historical quotation:** primary text, transcript, archival scan, or a scholarly edition with a locator.
- **Structured comparison:** source records for every compared entity, using the same time frame and field definitions.

Press coverage can describe community sentiment but cannot substitute for the underlying community records.

## Portable access cascade

For each source class, use the first available lawful route that fits the evidence need:

1. **Hermes-native direct route** — `web_search` for discovery and `web_extract` for the selected pages or PDFs.
2. **Existing research channels** — check `agent-reach doctor --json`; use **Exa via Agent Reach** (`mcporter call exa.web_search_exa` and `exa.web_fetch_exa`) for semantic discovery/retrieval, or **Jina Reader** for a known public URL.
3. **Configured search APIs** — run `Tools/SearchProviders.ts status` without exposing values. `TAVILY_API_KEY` enables query-focused Tavily search; `BRAVE_SEARCH_API_KEY` enables Brave's independent index. Search requires explicit quota/cost approval and uses the bounded basic route.
4. **Interactive browser** — `browser_exec` for dynamic public pages or direct-extraction failure.
5. **Source-specific tool** — an installed academic, GitHub, YouTube, social, or structured-data route when it better matches the source.
6. **Specialist retrieval fallback** — Apify for a supported actor/data shape, or Bright Data for an explicitly requested/approved proxy or crawl after the ordinary routes fail. Discover deferred tools at runtime with `tool_search`, then `tool_describe` and `tool_call`; never hard-code a provider MCP identifier.
7. **Search-only fallback** — discovery and context, with the limitation stated; do not present snippets as the source corpus.

Provider selection is task-shaped: Exa for semantic discovery, Tavily for query-focused current evidence, Brave for an independent index, and Jina for exact-URL extraction. Do not call every provider by habit, and do not confuse a present credential with spending approval.

Never bypass login, paywall, CAPTCHA, robots/access controls, or platform restrictions.

## Community-sentiment routing

Treat the request as sentiment-shaped when it asks what users, fans, viewers, players, customers, or a community thought; asks for reactions, ratings, favorites, disappointments, consensus, or whether something is “worth it”; or concerns a recent event with an implied reception question.

### Platform selection

Choose platforms based on where the relevant community actually congregates. Typical routes:

- **Reddit or public forums:** discover relevant communities and threads; retrieve public records directly when accessible; prefer high-participation threads and preserve thread URLs and scores.
- **YouTube:** use the installed YouTube/transcript route when available; use public comments only when the request requires audience reaction.
- **X, Bluesky, TikTok, Discord, Steam, or specialist forums:** use a configured source-specific skill or public browser route. If neither is available, state the gap rather than assuming a token or private wrapper.
- **Apify:** optional fallback for a supported public source after actor/schema inspection and cost approval; use the code-first Apify skill and filter before model context.

Sample at least two independent communities or threads when the user asks for consensus and the source population permits it. Preserve negative and minority signal rather than manufacturing balance.

### Sentiment evidence record

For every quoted reaction capture:

```json
{
  "quotation": "verbatim public text",
  "source_url": "https://…",
  "platform": "…",
  "published_at": "timestamp or unknown",
  "retrieved_at": "ISO-8601",
  "engagement": "score/replies/views when visible",
  "context": "thread or prompt being answered"
}
```

Do not reveal private handles or personal data unnecessarily. Paraphrase when verbatim reproduction would be disproportionate, while retaining the evidence locator.

## Research-source routing

- Academic: use the ArXiv/research route or primary publisher/repository.
- GitHub/software: official repository, release, commit, issue, and CI evidence.
- Current policy/law: official jurisdictional source first, then expert interpretation.
- Market/company: filings, company statements, product pages, job postings, customer records, and independent reporting; distinguish claims from observed evidence.
- Threat landscape: advisories, vulnerability databases, incident reports, and primary technical analysis; date every current-status assertion.

## Failure handling

Record whether a route was unavailable, blocked, incomplete, rate-limited, too costly, or outside authorization. Move down the cascade only for that reason. If the remaining route cannot support the requested claim, return `unavailable` or narrow the conclusion.

## Anti-patterns

- Search snippets presented as verified evidence.
- Scraper first when a lawful direct route exists.
- Credential or private-wrapper assumptions.
- One viral post presented as consensus.
- Press recap used as the sole source for “what people thought.”
- Engagement count without the text and context it measures.
- Unsupported exact counts after partial pagination.

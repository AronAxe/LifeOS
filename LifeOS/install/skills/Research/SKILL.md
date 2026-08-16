---
name: research
version: 2.1.0
category: LifeOS
portable: true
description: >
  Use for evidence-based web or corpus research: quick verified lookups,
  cross-checked investigations, claim-level verification, market or threat
  landscapes, interview preparation, and research-backed document improvement.
---

# Research — Hermes Evidence Workflow

## Default sequence

1. Define the question, freshness requirement, jurisdiction or time frame, and output format.
2. Select the lightest workflow that can answer it reliably.
3. Prefer primary sources: official documentation, papers, datasets, filings, standards, and direct statements.
4. Extract the actual pages, PDFs, transcripts, or records. Search snippets are discovery evidence only.
5. Cross-check consequential claims with an independent reliable source.
6. Keep notes tied to recoverable URLs or evidence paths.
7. Report conclusions, uncertainty, disagreement, and access limitations.

## Hermes routes

- `web_search` — default source discovery and current-fact lookup through the active Hermes provider.
- `web_extract` — default page and PDF extraction with recoverable source text.
- **Exa via Agent Reach** — semantic discovery with `mcporter call exa.web_search_exa`; use `exa.web_fetch_exa` to retrieve selected URLs when `agent-reach doctor --json` reports the route healthy.
- **Jina Reader** — keyless exact-URL extraction when the normal extractor cannot return readable content.
- `Tools/SearchProviders.ts` — optional direct Tavily and Brave Search adapter. `TAVILY_API_KEY` enables Tavily; `BRAVE_SEARCH_API_KEY` enables Brave. Run `status` to inspect presence without revealing values, and obtain quota/cost approval before `search --approved`.
- `browser_exec` — dynamic or interactive pages when direct extraction fails.
- `delegate_task` — bounded independent workstreams when parallelism materially improves coverage or verification.
- Source-specific skills or tools — academic papers, GitHub, YouTube, social platforms, structured datasets, or Fabric when installed and appropriate.

Provider choice is task-shaped, not a universal race. Use Exa for semantic discovery and full-page follow-up, Tavily for query-focused current evidence, Brave for an independent web index, and Jina for known-page extraction. Use Apify or Bright Data only as a specialist retrieval fallback after these routes fail or the requested source requires a supported actor/crawl. Do not treat a configured credential as permission to spend account quota.

Do not assume a hidden research command, provider-specific researcher type, local Claude template, filesystem MCP directory, credential, or undeployed orchestration runtime.

## Workflow routing

| Request | Workflow |
|---|---|
| One current fact or a deliberately quick lookup | `Workflows/QuickResearch.md` |
| Default multi-source research | `Workflows/StandardResearch.md` |
| Broad, multi-angle, or market/threat landscape research | `Workflows/ExtensiveResearch.md` |
| Iterative domain mapping with persistent artifacts | `Workflows/DeepInvestigation.md` |
| Claim-level adversarial verification | `Workflows/DeepVerifiedResearch.md` |
| Find or open a source or prior artifact | `Workflows/Retrieve.md` |
| Extract non-obvious decision-relevant findings | `Workflows/ExtractAlpha.md` |
| Prepare a high-information interview | `Workflows/InterviewResearch.md` |
| Verify supplied claims, citations, or a draft | `Workflows/Verify.md` |
| Improve an existing artifact using new evidence | `Workflows/Enhance.md` |
| Promote reviewed research into durable knowledge | `Workflows/ExtractKnowledge.md` |
| Apply an installed Fabric pattern to resolved content | `Workflows/Fabric.md` |
| Analyze AI capability or adoption movements | `Workflows/AnalyzeAiTrends.md` |
| Extract a structured public web corpus | `Workflows/WebScraping.md` |
| Acquire and analyze video transcripts | `Workflows/YoutubeExtraction.md` |
| Compatibility request using the former provider-named route | `Workflows/ClaudeResearch.md` |

`Templates/MarketResearch.md` and `Templates/ThreatLandscape.md` remain output profiles for extensive or deep investigations; they do not imply a separate runtime.

## Evidence rules

- Every material factual claim needs a recoverable source URL or evidence path.
- Cite the source that supports the sentence, not a search-results page when the underlying source is available.
- Distinguish publication date, event date, and retrieval date.
- Record paywalls, truncation, OCR gaps, dynamic rendering, and failed extraction.
- Do not manufacture quotations or fill inaccessible sections from context.
- For current facts, inspect live sources rather than relying on model memory.
- Community sentiment must be supported by actual community records; press coverage is not a substitute for what people said.

## Scale and delegation

For one fact, use the shortest verified path. For broad investigations, maintain a source ledger, deduplicate URLs, and verify requested counts before synthesis. Delegate independent questions rather than serial steps with hidden dependencies. Pass each child all required context; subagents cannot ask the principal questions.

## Safety

Respect site terms, robots and access controls, privacy, credentials, rate limits, and paid API costs. Do not bypass authentication, CAPTCHA, or anti-bot controls. Ask before a paid or custom-provider run when cost or egress has not been approved. Never place secrets in a prompt, report, installed skill, or source receipt.

## Completion

A research task is complete when the question is answered at the requested depth, decisive claims are sourced, contradictions are handled, requested artifacts exist, and the evidence can be recovered. A long bibliography without synthesis is not completion.

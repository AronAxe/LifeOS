---
name: LocalIntelligence
version: 1.1.0
description: "Portable US civic-intelligence digest for a configured hometown. Runs eight category fetchers with failure isolation, persists dated JSON plus latest.json in a project/configured data directory, and supports a shell-free external adapter for jurisdiction-specific categories. The bundled News fetcher is operational; other categories require the configured adapter and report unavailable honestly when absent. USE WHEN local news, hometown news, council agenda, permits, officials, legislation, elections, arrests, civic digest. NOT FOR national news or covert/private-person data collection."
effort: medium
---

# LocalIntelligence

## What it does

Builds a reproducible civic digest for a configured US hometown across eight
categories: construction, crime, business, officials, legislation, elections,
arrests, and news. The orchestrator isolates failures with `Promise.allSettled`,
records source status per category, and writes both a dated JSON artifact and
`latest.json`.

## Honest capability boundary

The bundled `FetchNews.ts` performs a real Patch RSS request. The other seven
categories vary too much by jurisdiction to pretend there is one universal
endpoint; they use the explicit external-adapter contract below. Without an
adapter they return `source_status: "unavailable"` with a reason. That is a valid
partial digest, not a successful fetch.

No Pulse dashboard, automatic refresh job, private crime skill, identity tree, or
principal-specific source configuration is installed.

## Required configuration

- `LIFEOS_PRINCIPAL_IDENTITY` — path to a principal-supplied Markdown file with:
  `- **Hometown:** City, ST (ZIP 12345, County County)`. No default identity path
  is assumed.
- `LIFEOS_LOCAL_INTELLIGENCE_DIR` — optional output directory. Defaults to
  `<PROJECT_ROOT>/.lifeos-local-intelligence`.
- `LIFEOS_LOCAL_INTELLIGENCE_ADAPTER` — optional executable path for
  jurisdiction-specific categories.

Optional project preferences belong at
`<LOCAL_INTELLIGENCE_DIR>/PREFERENCES.md`. API keys remain in the process
environment or the adapter's own approved configuration; never write them into a
skill file or digest.

## External adapter contract

Hermes launches the configured executable directly with `shell: false`:

```text
<adapter> <category> '<hometown-json>'
```

`category` is one of `construction`, `crime`, `business`, `officials`,
`legislation`, `elections`, or `arrests`. The executable must emit one JSON object:

```json
{
  "items": [
    {"title": "...", "source": "...", "url": "https://...", "date": "YYYY-MM-DD", "summary": "..."}
  ],
  "source_status": "ok",
  "errors": []
}
```

`source_status` is `ok`, `empty`, or `unavailable`. The launcher enforces a
30-second timeout, a 1 MiB output cap, direct execution without shell expansion,
and schema validation. Nonzero exit, malformed JSON, timeout, or missing adapter
becomes an `unavailable` result rather than crashing the whole digest.

## Workflow routing

| Workflow | Trigger | File |
|---|---|---|
| DailyBrief | daily local digest, what is happening in my city, refresh local intel | `Workflows/DailyBrief.md` |
| Construction | permits, what is being built | `Workflows/Construction.md` |
| Crime | local crime category | `Workflows/Crime.md` |
| Business | openings, closures, license events | `Workflows/Business.md` |
| Officials | mayor, council, school board, public officials | `Workflows/Officials.md` |
| Legislation | council agenda, ordinance, state/local legislation | `Workflows/Legislation.md` |
| Elections | election, ballot measure, candidate, polling information | `Workflows/Elections.md` |
| Arrests | public agency arrest or booking logs | `Workflows/Arrests.md` |
| News | local headlines | `Workflows/News.md` |

## Runtime architecture

```text
LocalIntelligence/
├── Tools/
│   ├── Hometown.ts          required configured-source parser
│   ├── ExternalAdapter.ts   shell-free optional adapter launcher
│   ├── Refresh.ts           eight-category orchestrator and persistence
│   ├── FetchNews.ts         bundled operational Patch RSS fetcher
│   └── Fetch*.ts            adapter-backed category fetchers
├── Workflows/               category and digest procedures
└── References/DataSources.md
```

Run the orchestrator from the resolved installed skill directory:

```bash
bun run <LOCAL_INTELLIGENCE_SKILL_DIR>/Tools/Refresh.ts
```

Output:

```text
<LOCAL_INTELLIGENCE_DIR>/<YYYY-MM-DD>_<city>_<state>_digest.json
<LOCAL_INTELLIGENCE_DIR>/latest.json
```

`latest.json` is a normal copy, not a symlink. Other approved tools may consume
it, but this skill does not register a dashboard or schedule.

## FetchResult contract

```typescript
type Item = {
  title: string
  source: string
  url: string
  date: string
  summary?: string
}
type FetchResult = {
  items: Item[]
  source_status: "ok" | "unavailable" | "empty"
  errors?: string[]
}
```

A dead category never blanks the digest. Surface `meta.errors` and
`sources_failed`; do not hide partial failure behind a polished summary.

## Data and safety constraints

- Public civic information only. Do not bypass CAPTCHAs, authentication, robots
  restrictions, or paywalls.
- Do not use paid people-search aggregators or infer sensitive facts about private
  individuals.
- Arrest and crime coverage must remain source-attributed and must not imply guilt
  beyond what the cited public record states.
- Current claims require source URLs and dates. Distinguish `empty` (successful
  source with no matching items) from `unavailable` (no adapter/source or failure).
- Never invent a hometown. Missing configuration exits with an actionable error.
- Old digest pruning is an explicit operator decision; no background deletion job
  is installed.

## Scheduling and retention

The installer creates no cron job. If the principal asks for recurring refresh,
create a Hermes cron job separately, after confirming the executable path,
environment, delivery destination, and data-retention policy. Durable semantic
retention through Hindsight is separate and requires explicit authorization; the
JSON artifacts remain the primary evidence.

## Completion evidence

Return the absolute dated and latest paths, category source statuses, total item
count, and every source error. A run with unavailable categories is partial and
must be labeled partial.

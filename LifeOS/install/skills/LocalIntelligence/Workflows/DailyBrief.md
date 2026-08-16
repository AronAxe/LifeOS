# DailyBrief Workflow

Run the eight-category civic digest for the configured hometown, persist the JSON
artifacts, and summarize the result without hiding unavailable sources.

## Prerequisites

- `LIFEOS_PRINCIPAL_IDENTITY` points to a readable principal-supplied file with a
  valid `Hometown` line.
- `LIFEOS_LOCAL_INTELLIGENCE_DIR` optionally selects the output directory.
- `LIFEOS_LOCAL_INTELLIGENCE_ADAPTER` is required for the seven
  jurisdiction-specific categories; News has a bundled fetcher.

## Procedure

1. Resolve the active installed LocalIntelligence skill directory.
2. Run:
   ```bash
   bun run <LOCAL_INTELLIGENCE_SKILL_DIR>/Tools/Refresh.ts
   ```
3. Parse the command's JSON summary and read
   `<LOCAL_INTELLIGENCE_DIR>/latest.json`.
4. Report every category's `source_status` and all `meta.errors` before the prose
   summary.
5. Summarize up to three items per successful category with date, publisher, and
   source URL.
6. Label the digest **partial** when any category is unavailable. Do not turn
   missing adapter coverage into an empty-news claim.

## Read-only summary mode

If the principal asks to summarize the existing digest without refreshing, do not
run the orchestrator. Read `<LOCAL_INTELLIGENCE_DIR>/latest.json`; if absent,
explain that no digest exists yet.

`Refresh.ts` has no `--force`, `--summary`, or `--json` flags. Do not advertise or
pass unsupported arguments.

## Output evidence

- `<LOCAL_INTELLIGENCE_DIR>/<YYYY-MM-DD>_<city>_<state>_digest.json`
- `<LOCAL_INTELLIGENCE_DIR>/latest.json` (a copy, not a symlink)
- Chat summary with source statuses, item count, errors, and cited links

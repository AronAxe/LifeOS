# Legislation Workflow

Pending and enacted laws affecting the hometown — both city ordinances and state-level legislation with local impact.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts` → `{ city, state }`.
2. Run `Tools/FetchLegislation.ts`; it calls the configured external adapter with category `legislation` and validates the returned `FetchResult`.
3. Return `FetchResult` partitioned into `pending` and `enacted` arrays inside `items`, with each item flagged via `metadata.status`.

## Sources

- OpenStates API (state legislature pending + enacted)
- Granicus / Legistar via well-known URL discovery
- City council meeting calendar (where exposed)

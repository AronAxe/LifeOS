# Arrests Workflow

Recent arrests in the hometown via publicly published police/sheriff blotters.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts` → `{ city, county }`.
2. Run `Tools/FetchArrests.ts`; it calls the configured external adapter with category `arrests` and validates the returned `FetchResult`.
3. Return `FetchResult`. Many cities will return `source_status: "unavailable"` — that is correct; do not invent.

## Sources

- County sheriff booking log (best-effort URL discovery)
- City PD daily blotter (best-effort URL discovery)
- Patch crime tag for the city as a soft fallback

## Constraints

- Only data published by official agencies on public pages.
- No paid people-search aggregators.
- No bypassing CAPTCHAs or paywalls.

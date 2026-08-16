# Elections Workflow

Upcoming elections, ballot measures, and candidate fields for the hometown.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts`.
2. Run `Tools/FetchElections.ts`; it calls the configured external adapter with category `elections` and validates the returned `FetchResult`.
3. Return `FetchResult`.

## Sources

- Ballotpedia API — upcoming elections, candidates, ballot measures
- Vote.gov state-by-state registration links
- County registrar of voters (best-effort URL discovery)

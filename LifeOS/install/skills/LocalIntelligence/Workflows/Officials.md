# Officials Workflow

Movements and news for the city's elected and appointed officials — mayor, council, city manager, school board.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts`.
2. Run `Tools/FetchOfficials.ts`; it calls the configured external adapter with category `officials` and validates the returned `FetchResult`.
3. Return `FetchResult`.

## Sources

- Ballotpedia API — officeholders, terms, recent coverage
- Google News topic search per official
- City press releases (RSS where present)

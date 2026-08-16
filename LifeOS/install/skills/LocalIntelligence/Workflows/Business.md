# Business Workflow

New business openings, closures, and notable license events in the principal's hometown.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts`.
2. Run `Tools/FetchBusiness.ts`; it calls the configured external adapter with category `business` and validates the returned `FetchResult`.
3. Return `FetchResult`.

## Sources

- City open-data business-license dataset (best-effort URL discovery)
- County clerk DBA / fictitious business name filings
- Local Chamber of Commerce member announcements (RSS where present)

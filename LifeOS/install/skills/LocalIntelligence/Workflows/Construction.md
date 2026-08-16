# Construction Workflow

New construction permits and major build-outs in the principal's hometown.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts`.
2. Run `Tools/FetchConstruction.ts`; it calls the configured external adapter with category `construction` and validates the returned `FetchResult`.
3. Return `FetchResult` shape: `{ items, source_status, errors? }`.
4. Surface up to 7 items in chat with title, date, source.

## Sources

- US Census Building Permits Survey (monthly, metro-level)
- City open-data portal — best-effort URL discovery
- Planning commission agendas via Granicus/Legistar discovery

# News Workflow

Local news headlines for the hometown.

## Procedure

1. Resolve hometown via `Tools/Hometown.ts`.
2. Run `Tools/FetchNews.ts`; the bundled implementation requests Patch RSS and returns an honest unavailable result if the source fails.
3. Return `FetchResult`.

## Sources

- Patch RSS (canonical URL, falls back gracefully)
- Google News topic search
- Optional regional outlet RSS configured by the external adapter or `<LOCAL_INTELLIGENCE_DIR>/PREFERENCES.md`

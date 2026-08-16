# Crime Workflow

Collect the crime category through the principal-configured LocalIntelligence
adapter. No private skill or crime-data source is bundled.

## Procedure

1. Resolve the hometown via `Tools/Hometown.ts`.
2. Confirm `LIFEOS_LOCAL_INTELLIGENCE_ADAPTER` is configured.
3. Run `Tools/FetchCrime.ts`. The launcher executes the adapter directly with
   category `crime` and the hometown JSON, then validates its `FetchResult`.
4. Return source status, source URLs, dates, and errors without embellishment.
5. Persist the result under the digest's `crime` key only when running DailyBrief.

## Safety constraints

- Public, source-attributed records only.
- No people-search aggregators, CAPTCHA/paywall bypass, or covert collection.
- An arrest or incident record is not a finding of guilt; preserve the source's
  wording and status.
- If the adapter is absent, fails, times out, or returns malformed output, report
  `source_status: "unavailable"`. Do not fall back to an undeployed private skill
  or silently query another service.

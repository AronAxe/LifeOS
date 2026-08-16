# Apify Integration Guide

## Installed contract

The skill ships a TypeScript Apify client (`index.ts`), actor wrappers (`actors/`), one X/Twitter helper (`skills/get-user-tweets.ts`), examples, and package metadata. It does not install a filesystem MCP or the historical `get-latest-tweet.ts`, `get-latest-thread.ts`, and debug scripts.

Resolve the loaded skill directory as `<APIFY_SKILL_DIR>` before executing commands. Do not assume the directory name because collision-safe installation may use a `lifeos-` prefix.

## Local client

From `<APIFY_SKILL_DIR>`:

```ts
import { Apify } from "./index"

const apify = new Apify(process.env.APIFY_TOKEN)
const actors = await apify.search("instagram scraper")
const run = await apify.callActor(actors[0].id, {
  profiles: ["target"],
  resultsLimit: 100,
})
const dataset = await apify.getDataset(run.defaultDatasetId)
const items = await dataset.listItems({ limit: 100 })
const relevant = items
  .filter((item) => item.likesCount > 1000)
  .slice(0, 10)
console.log(JSON.stringify(relevant))
```

The exact actor input and result schema must be checked before use.

## Shipped actor wrappers

Use exports under `actors/` for social media, Google Maps, Amazon, and web scraping. Inspect the selected wrapper, set strict input limits, and filter data in code. Keep large/intermediate datasets out of model context.

The bundled user-tweet helper can be invoked only after inspecting its help/source and confirming required configuration:

```text
bun <APIFY_SKILL_DIR>/skills/get-user-tweets.ts <username> <limit>
```

No account identity is bundled. Inputs such as “my latest post” require the principal to identify the account or provide configured context.

## Error handling

- Missing `APIFY_TOKEN`: stop with setup guidance; never expose a token.
- Actor failure/timeout: report actor/run identifiers and status.
- Empty dataset: verify input/schema before concluding there are no records.
- Changed actor schema: update the wrapper and tests through the skill-maintenance workflow.
- Chargeable run: obtain approval when cost has not already been authorized.

## Verification

Check run completion, dataset item count, representative item fields, filter behavior, final output count, and any output artifact written. Claims about token savings are workload-dependent; measure actual serialized input/output when material.

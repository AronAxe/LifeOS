#!/usr/bin/env bun
/**
 * FetchLegislation — pending and enacted laws affecting the hometown.
 *
 * Universal sources:
 *  - OpenStates API (state-level pending + enacted)
 *  - Granicus / Legistar via well-known URL discovery (city-level)
 *  - City council meeting calendar (where exposed)
 *
 * Items carry metadata.status = "pending" | "enacted".
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchLegislation(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("legislation", home) ?? unavailable(
    "legislation requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no bundled API credential or council endpoint is assumed",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchLegislation(home), null, 2))
}

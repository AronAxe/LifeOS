#!/usr/bin/env bun
/**
 * FetchArrests — recent arrests via publicly published police/sheriff blotters.
 *
 * Universal sources (all best-effort discovery, no paid aggregators):
 *  - County sheriff booking log
 *  - City PD daily blotter
 *  - Patch crime tag for the city as a soft fallback
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchArrests(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("arrests", home) ?? unavailable(
    "arrests requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no bundled national source is sufficiently uniform",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchArrests(home), null, 2))
}

#!/usr/bin/env bun
/**
 * FetchElections — upcoming elections, ballot measures, candidate fields.
 *
 * Universal sources:
 *  - Ballotpedia API
 *  - Vote.gov state-by-state registration links
 *  - County registrar of voters (best-effort URL discovery)
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchElections(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("elections", home) ?? unavailable(
    "elections requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no bundled credential or jurisdiction mapping is assumed",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchElections(home), null, 2))
}

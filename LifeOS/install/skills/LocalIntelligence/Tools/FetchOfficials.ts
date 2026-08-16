#!/usr/bin/env bun
/**
 * FetchOfficials — movements and news for elected/appointed officials.
 *
 * Universal sources:
 *  - Ballotpedia API (officeholders + recent coverage)
 *  - Google News topic search per official
 *  - City press releases (RSS where present)
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchOfficials(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("officials", home) ?? unavailable(
    "officials requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no bundled jurisdiction mapping is assumed",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchOfficials(home), null, 2))
}

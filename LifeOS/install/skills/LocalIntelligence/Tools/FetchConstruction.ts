#!/usr/bin/env bun
/**
 * FetchConstruction — building permits and major construction signal.
 *
 * Universal sources:
 *  - US Census Building Permits Survey (monthly, MSA/place-level)
 *  - City open-data portal — best-effort URL discovery
 *  - Planning commission agendas via Granicus/Legistar discovery
 *
 * Uses the configured category adapter. Census BPS is a recommended adapter
 * source, but place/metro resolution is not guessed in the bundled tool.
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchConstruction(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("construction", home) ?? unavailable(
    "construction requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no place/metro mapping is guessed",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchConstruction(home), null, 2))
}

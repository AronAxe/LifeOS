#!/usr/bin/env bun
/**
 * FetchCrime — delegates to the configured LocalIntelligence adapter.
 *
 * The bundled skill does not scrape people-search or jurisdiction-specific crime
 * sources. A principal-configured executable owns source selection and emits the
 * common FetchResult envelope.
 */

import type { FetchResult, Hometown } from "./Types.ts"
import { unavailable } from "./Types.ts"
import { fetchFromExternalAdapter } from "./ExternalAdapter.ts"

export async function fetchCrime(home: Hometown): Promise<FetchResult> {
  return fetchFromExternalAdapter("crime", home) ?? unavailable(
    "crime requires LIFEOS_LOCAL_INTELLIGENCE_ADAPTER; no private crime skill or source is bundled",
  )
}

if (import.meta.main) {
  const { readHometown } = await import("./Hometown.ts")
  const home = await readHometown()
  console.log(JSON.stringify(await fetchCrime(home), null, 2))
}

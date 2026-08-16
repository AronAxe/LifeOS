#!/usr/bin/env bun
/**
 * ExternalAdapter — optional category adapter for LocalIntelligence.
 *
 * Configure LIFEOS_LOCAL_INTELLIGENCE_ADAPTER with an executable path. The
 * executable is launched directly (never through a shell) with two arguments:
 * category and a JSON-encoded Hometown. It must emit one FetchResult JSON object
 * on stdout. Missing configuration returns null so callers can use a built-in
 * implementation or an honest unavailable result.
 */

import { spawnSync } from "node:child_process"
import type { FetchResult, Hometown, SectionKey } from "./Types.ts"

const MAX_OUTPUT_BYTES = 1024 * 1024

function isFetchResult(value: unknown): value is FetchResult {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return (
    Array.isArray(record.items) &&
    (record.source_status === "ok" ||
      record.source_status === "empty" ||
      record.source_status === "unavailable") &&
    (record.errors === undefined ||
      (Array.isArray(record.errors) && record.errors.every((item) => typeof item === "string")))
  )
}

export function fetchFromExternalAdapter(
  category: SectionKey,
  home: Hometown,
  executable: string | undefined = process.env.LIFEOS_LOCAL_INTELLIGENCE_ADAPTER,
): FetchResult | null {
  if (!executable?.trim()) return null

  const result = spawnSync(executable, [category, JSON.stringify(home)], {
    encoding: "utf8",
    shell: false,
    timeout: 30_000,
    maxBuffer: MAX_OUTPUT_BYTES,
    windowsHide: true,
  })

  if (result.error) {
    return {
      items: [],
      source_status: "unavailable",
      errors: [`${category} adapter failed: ${result.error.message}`],
    }
  }
  if (result.status !== 0) {
    const detail = (result.stderr || "").trim().slice(0, 500)
    return {
      items: [],
      source_status: "unavailable",
      errors: [`${category} adapter exited ${result.status}${detail ? `: ${detail}` : ""}`],
    }
  }

  try {
    const parsed: unknown = JSON.parse(result.stdout)
    if (!isFetchResult(parsed)) throw new Error("output does not match FetchResult")
    return parsed
  } catch (error) {
    return {
      items: [],
      source_status: "unavailable",
      errors: [`${category} adapter returned invalid JSON: ${(error as Error).message}`],
    }
  }
}

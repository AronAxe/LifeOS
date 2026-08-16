# URL and Evidence Verification Protocol

Every material citation must resolve to evidence that supports the nearby claim. A plausible URL or successful status code is not enough.

## Verification sequence

1. Open the exact URL with `web_extract`.
2. Confirm title, publisher or author, date, and the cited passage or record.
3. Record a locator: heading, paragraph, page, table, timestamp, commit, issue, or dataset field.
4. If direct extraction fails, use `browser_exec` and note that the page required interactive rendering.
5. If the source moved, cite the canonical replacement and record the redirect or archival relationship.
6. If the source is blocked, truncated, mismatched, deleted, or inaccessible, remove the unsupported claim or label it unresolved.

An HTTP `200` only proves that a server returned something. It does not prove that the content exists as described or supports the assertion.

## Verification record

```json
{
  "url": "https://…",
  "title": "…",
  "publisher": "…",
  "published_at": "date or unknown",
  "retrieved_at": "ISO-8601",
  "locator": "page/section/timestamp/record",
  "supports": "claim identifier",
  "status": "verified | partial | blocked | mismatched | missing",
  "note": "limitation or conflict"
}
```

## Batch work

For many sources, verify in bounded parallel groups, deduplicate canonical URLs, and count requested versus verified sources. Do not silently drop failed URLs; preserve them in the evidence ledger with status and exclude them from affirmative support.

## Cross-checking

Consequential quantitative, causal, legal, safety, or current-status claims need an independent source when one reasonably exists. Independence means a genuinely separate evidence chain, not several articles repeating the same press release.

## Confidence

- `HIGH`: strong recoverable evidence plus independent confirmation.
- `MED`: credible evidence with limited independence or minor qualification.
- `LOW`: weak, indirect, stale, or incomplete evidence.
- `CONFLICT`: credible evidence disagrees.

A child agent's confidence label is a proposal. The parent must inspect the evidence before carrying it into the answer.

## Completion

Verification is complete when every material citation has been opened and matched to its claim, failures are visible, and no removed or inaccessible URL has been restored during synthesis.

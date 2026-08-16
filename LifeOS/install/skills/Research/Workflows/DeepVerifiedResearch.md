# Deep Verified Research

Use this workflow when a consequential answer must survive claim-level adversarial review. It preserves the former executable harness's method without pretending Hermes can run its undeployed `args`/`agent`/`parallel` globals.

## Inputs

Record:

- the exact research question and decision it informs;
- freshness, jurisdiction, and source constraints;
- maximum claim count and time or cost budget;
- approved output directory, if durable artifacts are requested.

## 1. Scope independent angles

Create two to six complementary search angles: primary/official, academic, current developments, practitioner evidence, community evidence when relevant, and a disconfirming angle. Use `delegate_task` only when the angles are independent and each child can receive a complete brief.

## 2. Extract falsifiable claims

For each useful source, record a bounded claim object:

```json
{
  "claim": "A concrete statement that could be false",
  "direct_quotation": "Exact supporting text",
  "source_url": "https://…",
  "source_title": "…",
  "source_date": "YYYY-MM-DD or unknown",
  "retrieved_at": "ISO-8601",
  "source_quality": "primary | secondary | practitioner | community | weak",
  "importance": "central | supporting | tangential",
  "locator": "page, section, timestamp, table, or paragraph"
}
```

A source URL without a direct quotation and locator is discovery evidence, not a verified claim. Deduplicate claims by proposition and source.

## 3. Rank the verification set

Verify central claims first, then quantitative, causal, surprising, or decision-changing claims. State which claims were omitted because of the cap; omission is not confirmation.

## 4. Run three independent verifier lenses

Give every verifier the same claim set but a distinct brief. A bounded `delegate_task` batch may run these in parallel:

1. **quote-support** — does the direct quotation actually establish the claim, or is it an overreach, context loss, or cherry-pick?
2. **contradiction** — what credible evidence disputes, refutes, narrows, or dates the claim?
3. **source-strength** — is provenance, recency, and source quality sufficient for the claim's strength?

Each verifier returns for every claim: `supported | refuted | qualified | abstain`, a short reason, and any counter-source URL. Missing verdicts count as `abstain`.

## 5. Apply the fail-closed vote rule

A claim survives only when:

- at least two independent verifier lenses rendered a non-abstaining verdict;
- fewer than two lenses refuted it; and
- any qualification is carried into the final wording.

An **all-abstain** or under-adjudicated claim never survives as confirmed. Preserve it only under `Unresolved` with the reason verification failed.

## 6. Verify the source records

Use `web_extract` or `browser_exec` to confirm that each surviving URL resolves to the cited content. HTTP success alone is insufficient. Record blocked, moved, mismatched, or inaccessible sources and downgrade or remove claims whose evidence cannot be recovered.

## 7. Synthesize

Produce:

- executive answer;
- verified findings with `HIGH | MED | LOW | CONFLICT` confidence;
- qualifications and counter-evidence;
- rejected or unresolved claims and why;
- open questions;
- source ledger and verification counts.

`HIGH` requires strong recoverable evidence and independent adjudication. Never restore a dropped URL or smooth a conflict into consensus.

## Optional artifacts

When durable output is requested, write:

- `scope.json`
- `claims.json`
- `verdicts.json`
- `source-ledger.json`
- `report.md`

Write only to the approved workspace, never into the installed skill directory. Re-read the files, verify counts, and report partial verifier failures explicitly.

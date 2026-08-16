# Research Verification Workflow

Use to audit claims, citations, a draft report, or findings returned by another workflow.

## 1. Normalize claims

Split the material into falsifiable units. Assign each a stable ID and record:

```json
{
  "id": "C-001",
  "claim": "…",
  "claim_type": "quantitative | causal | current-status | historical | interpretive",
  "importance": "central | supporting",
  "supplied_sources": ["https://…"]
}
```

Do not verify a paragraph as one unit when it contains several independently false statements.

## 2. Inspect supplied evidence

For every source:

- open it with `web_extract` or `browser_exec`;
- confirm authorship/publisher, date, exact passage, and locator;
- assess whether the source supports the claim as worded;
- note circular citations or sources that merely repeat the same origin.

Follow `../UrlVerificationProtocol.md`.

## 3. Seek independent and disconfirming evidence

For central, quantitative, causal, legal, safety, or current-status claims, search independently. Prefer primary evidence. Specifically seek contradictions, changed status, denominator errors, selection effects, and wording stronger than the evidence.

For a small set of consequential disputed claims, route to `DeepVerifiedResearch.md` for quote-support, contradiction, and source-strength adjudication.

## 4. Assign verdicts

- `VERIFIED` — claim is supported as written by strong recoverable evidence.
- `QUALIFIED` — core is supported but scope, date, causality, or certainty must be narrowed.
- `CONFLICT` — credible evidence disagrees.
- `UNSUPPORTED` — evidence is missing, inaccessible, mismatched, or too weak.
- `FALSE` — strong evidence directly refutes it.

Map confidence separately as `HIGH | MED | LOW`; verdict and confidence are not the same field.

## 5. Return an audit table

| ID | Verdict | Corrected wording | Evidence | Counter-evidence | Notes |
|---|---|---|---|---|---|

Then provide:

- corrected synthesis containing only supported wording;
- claims removed and why;
- unresolved conflicts;
- source-verification counts;
- remaining checks that require access, credentials, or expertise not available.

## Failure rules

- A missing verifier result is not confirmation.
- A successful HTTP response is not content verification.
- Several dependent sources do not constitute independent confirmation.
- If only one research workstream returned, disclose that cross-checking did not occur.
- Never restore a URL or claim discarded during verification merely to make the report look complete.

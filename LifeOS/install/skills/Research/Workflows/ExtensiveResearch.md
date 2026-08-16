# Extensive Research Workflow

Use for broad multi-domain research, market research, threat landscapes, or decisions where coverage and disconfirmation matter. Use `DeepInvestigation.md` instead when the work needs a persistent iterative model of entities and gaps; use `DeepVerifiedResearch.md` when claim adjudication is the dominant requirement.

## 1. Define the coverage contract

Specify:

- primary question and decision;
- domains, populations, entities, geography, and time range;
- freshness and primary-source requirements;
- required output profile, including `../Templates/MarketResearch.md` or `../Templates/ThreatLandscape.md` when applicable;
- approved time, cost, storage, and egress boundaries.

Create an explicit coverage matrix so “comprehensive” has a testable meaning.

## 2. Design explorer and verifier angles

Generate five to nine complementary angles. Typical explorer angles include official/primary, technical or academic, current developments, practitioner reality, commercial or adoption evidence, community sentiment, alternatives, and edge cases. Reserve at least two angles for verification:

- most important quantitative and current-status claims;
- contradictions, debunked claims, and counter-evidence.

## 3. Execute bounded workstreams

Use `delegate_task` for independent angles in batches that respect the current concurrency limit. Each task brief must include the question, its assigned angle, source and date requirements, evidence schema, output cap, and instruction to return URLs and quotations. Children cannot ask the principal questions, so resolve ambiguities first.

The parent retains the coverage matrix and source ledger. A child summary is not proof that a URL was opened or an artifact was written.

## 4. Build the evidence ledger

For each source retain:

```json
{
  "angle": "…",
  "claim": "…",
  "quotation_or_field": "…",
  "url": "https://…",
  "title": "…",
  "published_at": "date or unknown",
  "retrieved_at": "ISO-8601",
  "locator": "…",
  "source_quality": "primary | secondary | practitioner | community | weak",
  "limitations": []
}
```

Deduplicate canonical URLs and proposition-equivalent claims. Preserve which angle and source produced each finding.

## 5. Verify and challenge

Open decisive sources directly. Cross-reference explorer findings against verifier evidence and independent sources. Upgrade, qualify, downgrade, or reject claims based on the evidence—not on how many summaries repeat them. Use `DeepVerifiedResearch.md` for any small set of claims that requires the three-lens vote.

## 6. Fill gaps deliberately

Compare completed evidence against the coverage matrix. Run a second bounded wave only for material gaps, contradictions, or sparse primary evidence. Stop when:

- every required area is covered or explicitly unavailable;
- additional searches repeat known sources without changing the decision;
- the approved budget is exhausted.

## 7. Deliver

Produce:

- executive answer;
- methodology and actual coverage;
- verified findings by theme;
- market/threat/entity tables when requested;
- conflicts, rejected claims, and uncertainty;
- implications and recommendations;
- open questions;
- source ledger and counts: discovered, opened, verified, blocked, rejected.

Never claim full coverage when a required source class or region was inaccessible.

## Optional durable artifacts

When requested, write `scope.md`, `coverage.json`, `source-ledger.json`, `findings.json`, and `report.md` to an approved workspace. Re-read each artifact and verify row and source counts before reporting completion.

# Deep Investigation Workflow

Use for broad domains where one search pass would miss entities, relationships, or important counterevidence. The workflow is iterative and persists auditable state in the current task workspace.

## 1. Define scope and completion

Set the question, decision criteria, geography/time horizon, entity type, exclusion rules, requested depth, and completion threshold. Decompose the work into independent evidence tracks before delegating.

## 2. Landscape pass

Map the domain structure, vocabulary, major categories, key dynamics, known disputes, and initial entities. Search with multiple formulations and source classes. Produce:

- `landscape.md` — domain map and open questions;
- `source-ledger.json` or `.csv` — canonical source receipts;
- `entities.json` — deduplicated entity catalog.

Recommended entity fields:

```text
id, name, aliases, category, status, value_score, effort_score,
confidence, source_ids, last_checked, next_question
```

Use stable IDs so later updates do not break references.

## 3. Evaluate and prioritize

Score entities against the declared decision criteria, not generic popularity. Record evidence and uncertainty for each score. Status values should distinguish at least `discovered`, `screened`, `investigating`, `verified`, `rejected`, and `blocked`.

## 4. Expand coverage

Search for missing categories, competitors/alternatives, cited peers, geography-specific entities, failures, and dissenting views. Deduplicate aliases and corporate/project renames. Persist each batch before the next search so progress survives timeouts.

## 5. Deep profile

Investigate one high-priority entity at a time. A profile should include:

- identity and canonical links;
- relevant capability/offer;
- evidence against each decision criterion;
- limitations, risks, cost/access constraints;
- relationships and alternatives;
- contradictions and unresolved questions;
- verdict, confidence, and next action;
- verified source list.

Store profiles under an approved task-workspace location such as `profiles/<entity-id>.md`.

## 6. Verification pass

Open every decisive URL, confirm that it refers to the correct entity/version, verify dates and quoted claims, and search for counterevidence. Mark inaccessible or stale sources. Do not infer a current fact from an old profile without rechecking it.

## 7. Loop gate

After each cycle report catalog size, category coverage, profiles completed, blocked items, marginal new entities per search, and unresolved high-impact questions. Continue only when another cycle is likely to alter the decision or when the requested coverage is unmet.

## 8. Final synthesis

Lead with the answer and decision implications. Include methodology, coverage, ranked entities/findings, rejected alternatives, disagreements, uncertainty, and source ledger. Distinguish single-run output from an incomplete investigation state; missing evidence never becomes certainty.

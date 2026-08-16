# Extract Knowledge Workflow

Use when research findings should become reviewed durable knowledge rather than remain only in a report.

## 1. Resolve the original source

Open the URL, file, transcript, paper, dataset, or repository record with the appropriate Research route. Keep a source receipt containing canonical location, title, author/publisher, publication date, retrieval date, content type, and access limitations.

Do not promote a search snippet, another model's summary, or an inaccessible citation as if it were the source.

## 2. Extract bounded knowledge units

Create one unit per claim, distinction, mechanism, decision, quotation, or open question. Each unit records:

```json
{
  "statement": "…",
  "type": "fact | interpretation | mechanism | quotation | decision | question",
  "source": "https://… or approved evidence path",
  "locator": "page, section, paragraph, timestamp, commit, or field",
  "published_at": "date or unknown",
  "retrieved_at": "ISO-8601",
  "confidence": "HIGH | MED | LOW | CONFLICT",
  "uncertainty": "…",
  "related_topics": []
}
```

Keep exact quotations distinct from paraphrases. Preserve material qualifications and counter-evidence.

## 3. Compare against existing knowledge

Use the Knowledge skill and Hindsight/LCM routes to find overlap, contradiction, superseded status, and related decisions. A fluent new synthesis does not automatically replace an older sourced claim.

Classify each unit:

- new;
- corroborates existing;
- extends existing;
- contradicts existing;
- supersedes with explicit evidence;
- temporary/unaccepted;
- unresolved.

## 4. Review promotion

Present material conflicts, durable decisions, and graph promotions for approval. Route:

- stable accepted facts or decisions to Hindsight;
- reviewed relational decision architecture to the optional cognitive graph;
- temporary, speculative, or unaccepted material to the task workspace or ISA;
- source artifacts to an approved evidence directory.

Do not write to the installed Research skill directory. Do not create an automatic ingestion or background-mining job.

## 5. Verify retention

After approved writes:

1. read back the changed artifact or memory result;
2. search or recall a representative unit;
3. confirm provenance and uncertainty survived;
4. confirm no unrelated prior claim was overwritten;
5. report units accepted, rejected, conflicted, deferred, and unverifiable.

## Completion

Knowledge extraction is complete only when the original source remains recoverable, each promoted unit is bounded and attributable, conflicts are visible, approvals were respected, and representative durable units can be recalled.

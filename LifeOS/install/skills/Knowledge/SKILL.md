---
name: knowledge
category: LifeOS
version: 2.0.0
status: Hermes-native
portable: true
description: >
  Manage durable knowledge on Hermes through Hindsight, source receipts, session
  retrieval, and an optional reviewed cognitive graph. Use for capture, recall,
  synthesis, contradiction review, and knowledge-layer routing.
---

# Knowledge — Hermes-Native Contract

## Purpose

Turn useful information into retrievable, evidence-bearing knowledge without recreating the retired LifeOS filesystem index. Hindsight is the default semantic memory backend; source files remain authoritative for their own content; session tools recover conversational history; the cognitive graph is reserved for reviewed decision architecture.

HALOS installs no automatic harvester, graph indexer, transcript miner, or background knowledge job. Capture is explicit or separately scheduled with consent.

## Layer boundaries

| Information | Destination | Rule |
|---|---|---|
| Stable facts, entities, relationships, decisions, reusable context | Hindsight | Retain with enough provenance to distinguish fact from interpretation |
| Current-session detail | LCM/session context | Do not promote merely because it was mentioned |
| Past conversation evidence | `session_search`, `lcm_recall`, or bounded LCM retrieval | Retrieve before asking the principal to repeat context |
| Documents, media, datasets, notes | Their configured source | Keep a receipt or locator; do not replace the source with a summary |
| Values, heuristics, tensions, assumptions, mental models, preferences | Optional reviewed cognitive graph | Promote only with evidence and the graph's acceptance policy |
| Temporary plans, candidates, unaccepted recommendations | Workspace/ISA | Keep ephemeral until accepted |
| Credentials, secrets, raw private payloads | Nowhere in general memory | Store only through the system designed for that secret class |

General knowledge does not belong in the cognitive graph. The graph models how the principal thinks, not everything the principal knows.

## Retrieve

### Semantic memory

Use `hindsight_recall` for evidence-bearing retrieval and `hindsight_reflect` when the task requires synthesis across memories. Phrase queries with the entity, decision, time frame, and relation you need.

Do not treat an empty result as proof that no knowledge exists. Check the direct source when one was supplied, then use session retrieval and relevant files.

### Conversation history

Use:

- `session_search` for known prior Hermes sessions and exact historical decisions;
- `lcm_recall` for cross-conversation semantic recall;
- `lcm_grep` for exact terms or bounded time ranges;
- `lcm_expand`/`lcm_load_session` only after locating the relevant evidence.

Session summaries are navigation aids. Verify consequential claims against raw messages or the original source.

### Source-first rule

A URL, repository, document, inbox, application, database, or configured TELOS directory is primary evidence about its current contents. Inspect it before concluding from memory that the item is absent or unchanged.

## Retain

Use `hindsight_retain` only when the information is durable and likely to matter later. Good candidates include:

- stable preferences and corrections;
- accepted decisions and their rationale;
- durable project architecture;
- reusable facts or relationships;
- a concise source receipt needed to recover the original.

Do not retain:

- task progress or transient TODO state;
- unaccepted recommendations;
- rapidly expiring status;
- raw transcripts or large source documents;
- passwords, tokens, or credentials;
- summaries that cannot be traced to evidence.

Write compact declarative knowledge. Preserve uncertainty, attribution, date, and source class when they matter.

## Ingest a source

For a URL, file, transcript, dataset, or pasted corpus:

1. inspect the original and preserve a source receipt;
2. extract bounded semantic claims with attribution, date, uncertainty, and locators;
3. route durable claims to Hindsight, governed decision-architecture candidates to the optional cognitive graph, and temporary/unaccepted material to the workspace or ISA;
4. search existing memories/entities for overlap, contradiction, and affected relationships;
5. present material conflicts or graph promotions for review rather than silently merging them;
6. retain only approved durable units and verify retrieval afterward.

Use the Migrate skill for large or mixed external corpora. The source remains authoritative; ingestion does not replace it with a lossy summary.

## Develop an existing idea

Retrieve the idea and its evidence, then gather related memories, direct sources, counterarguments, and prior decisions. Produce an updated synthesis that marks supported facts, inference, unresolved questions, and decision implications. If the principal accepts a durable revision, retain the concise delta with provenance and confirm it can be recalled. Do not overwrite prior claims merely because a newer synthesis is more fluent.

## Contradiction review

When retrieved claims conflict:

1. Preserve both claims and their provenance.
2. Check timestamps and whether one source is superseded.
3. Inspect the direct source when available.
4. Ask the principal only when evidence cannot resolve a consequential ambiguity.
5. Record the correction or accepted decision; do not silently rewrite history.

A contradiction is a review state, not permission to choose the more convenient statement.

## Synthesis

Synthesis may connect retrieved memories and sources, but it must distinguish:

- quoted or directly supported facts;
- reasonable inference;
- unresolved hypothesis;
- recommendation.

Use `hindsight_reflect` for broad synthesis, then verify high-impact conclusions against source evidence. Never promote a synthesis into durable memory merely because the model produced it; retain only the accepted, stable result.

## Optional cognitive-graph route

Use the cognitive graph only when that capability is installed and the candidate concerns one of its governed types: value, heuristic, tension, assumption, mental model, preference, or project decision architecture. Require explicit language or repeated independent evidence according to the graph's policy. Ordinary facts, documents, activity logs, and semantic-memory entries remain outside it.

## Status and health

There is no deployed `KnowledgeHarvester.ts`, `KnowledgeGraph.ts`, `MemoryRetriever.ts`, or `SessionHarvester.ts` command. Do not construct paths to them.

Assess the actual components instead:

- call Hindsight recall with a known query and inspect the returned evidence;
- inspect the configured Hindsight provider/runtime when operational health is in scope;
- query session retrieval with a known prior term;
- check the optional cognitive graph through its own documented health command;
- verify source access directly.

Provider selection or plugin registration is not end-to-end health proof.

## Scheduled harvesting

HALOS creates no harvesting job. If recurring capture is proposed, define the exact source, promotion policy, cost, deduplication, privacy boundary, delivery, and rollback. Obtain explicit approval before creating a cron job. The job must be self-contained and must not recursively create other jobs.

## Completion standard

A knowledge operation is complete only when:

- the correct layer was chosen;
- the source or retrieved evidence was inspected;
- uncertainty and provenance were preserved;
- any durable write was read back or otherwise verified;
- no unsupported runtime path or automatic behavior was claimed.

## Cross-references

- **Memory** — durable-memory policy and Hindsight use
- **Schema** — portable principal-scoped identifiers and metadata
- **ContextSearch** — prior-session and artifact retrieval
- **Migrate** — consent-gated promotion from external material
- **Freshness** — staleness and review decisions
- **Containment** — public/private and source-boundary checks

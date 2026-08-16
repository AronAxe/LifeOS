---
name: migrate
version: 2.0.0
category: LifeOS
portable: true
description: >
  Use when importing existing notes, rules, exports, or another LifeOS/HALOS
  corpus. Produces a read-only routing manifest first, then applies only the
  principal-approved destinations with provenance and verification.
---

# Migrate — Consent-Gated External Content Intake

## Contract

Migrate reads existing material, segments it, proposes destinations, and records provenance. It does **not** infer permission to write from model confidence. The first pass is always read-only; mutations begin only after the principal approves specific routes or an explicitly presented batch.

HALOS does not ship `MigrateScan.ts` or `MigrateApprove.ts`. Use Hermes file, document, archive, and memory tools directly.

## Supported sources

- `.md`, `.markdown`, and `.txt` files;
- directories of text files;
- pasted content or stdin captured into a workspace artifact;
- Obsidian, Notion, Apple Notes, and similar exports after format inspection;
- rule files from another agent harness;
- another LifeOS/HALOS TELOS or knowledge corpus;
- structured documents supported by Hermes document skills.

Binary, multimodal, database, or proprietary exports require the relevant extraction skill. Do not silently discard unreadable content.

## Destination classes

| Content | Proposed destination |
|---|---|
| Mission, goals, problems, strategies, beliefs, wisdom, models, narratives | Configured `TELOS_DIR`, only with explicit section-level approval |
| Stable facts, entities, relationships, accepted decisions | Hindsight |
| Values, heuristics, tensions, assumptions, mental models, preferences | Optional reviewed cognitive graph, under its evidence policy |
| General documents, research, media, timeline evidence | Principal-selected source archive/Second Brain surface |
| Agent collaboration or operational rules | The governed repository/configuration/skill surface after its own safety review |
| Temporary candidates and unresolved classifications | Workspace migration manifest |
| Credentials and secrets | Excluded; route only through an approved secret store |
| Unclear material | No destination until the principal decides |

Do not recreate `MEMORY/KNOWLEDGE` or a hidden `USER` tree unless the installation explicitly defines those stores.

## Phase 1 — Establish scope

Identify the exact source, allowed file types, desired destinations, privacy boundary, and whether external model calls are permitted. If the source was provided directly, inspect it before searching memory or asking the principal to repeat its contents.

For a directory, enumerate candidates and present counts before reading broadly. Exclude caches, dependencies, backups, generated output, credentials, and binary files by default.

## Phase 2 — Extract with receipts

Read the source using the relevant Hermes tool. For every chunk preserve:

- stable chunk ID;
- source path or source identifier;
- source type;
- line/page/time range when available;
- content hash when deterministic hashing is appropriate;
- verbatim excerpt or recoverable locator;
- extraction warnings and confidence.

A summary is not a replacement for the receipt.

## Phase 3 — Build a read-only routing manifest

Create a workspace JSON or CSV artifact with one row per chunk:

```json
{
  "chunk_id": "source-hash:0001",
  "source": "configured/source.md",
  "locator": "lines 20-34",
  "proposed_class": "telos:goals",
  "proposed_destination": "${TELOS_DIR}/GOALS.md",
  "confidence": 0.78,
  "rationale": "Explicit long-term objective",
  "status": "pending-principal-decision"
}
```

Confidence governs review priority, not authorization:

- high confidence: eligible for compact batch review;
- medium confidence: show alternatives;
- low confidence: require individual review;
- unclear: leave unrouted.

No destination write occurs in this phase.

## Phase 4 — Present the proposal

Summarize source coverage, unreadable items, proposed counts by destination, duplicates, conflicts, and unresolved chunks. Offer review modes without assuming one:

- review every chunk;
- review one destination class;
- approve an explicitly enumerated batch;
- reject or defer selected chunks.

A later “continue” does not select an unanswered option.

## Phase 5 — Apply approved routes

Apply only decisions recorded as approved.

### TELOS

Resolve the configured `TELOS_DIR`; never guess a path. Read the target before editing, preserve its format, append or patch narrowly, include the source receipt, and verify the resulting section. Identity-bearing or constitutional files always require explicit approval regardless of confidence.

### Hindsight

Retain only stable, reusable facts or accepted decisions. Use compact declarative statements with provenance and uncertainty. Do not store task progress, raw documents, transient candidates, or secrets.

### Cognitive graph

Use only when installed and only for governed cognitive-pattern types. Require the graph’s evidence threshold and correction policy. Do not promote ordinary facts or document chunks.

### Repository, config, skills, hooks, or services

These are operating-environment changes. Perform the applicable dependency/blast-radius review, use the governed authoring workflow, prepare rollback, and obtain the required approval. Never translate a foreign harness rule literally when Hermes semantics differ.

### Source archive

Write to the principal-selected archive through its native adapter. Keep filenames, timestamps, and receipts deterministic; never claim a source was imported when only a summary was retained.

## Phase 6 — Verify and report

For each applied destination:

1. read back or query the result;
2. confirm the approved content and provenance landed once;
3. record duplicates, skips, and failures;
4. leave unresolved chunks pending rather than guessing;
5. provide a manifest with counts and evidence paths.

The completion report separates `approved-and-written`, `approved-but-failed`, `rejected`, `deferred`, `duplicate`, and `unreadable`.

## Rules

- Every promoted chunk carries a recoverable source receipt.
- Confidence never substitutes for consent.
- Do not bulk-approve `unclear` content.
- Do not overwrite existing material without a diff and explicit authorization.
- Preserve contradictory claims until evidence or the principal resolves them.
- Deduplicate by normalized content plus source context; a substring check alone is insufficient.
- Keep unaccepted recommendations and routing candidates ephemeral.
- Never migrate credentials into general memory, TELOS, skill files, or logs.
- Verify the final destination, not merely the write command.

## Related skills

- **Interview** — elicit missing context rather than import existing content
- **Telos** — governed TELOS reads and updates
- **Knowledge** and **Memory** — semantic-memory routing
- **Containment** — private/public and source-boundary review
- **CreateSkill** — governed skill changes
- Document and archive skills — source-specific extraction

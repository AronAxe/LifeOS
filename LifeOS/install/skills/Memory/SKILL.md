---
name: memory
description: Map LifeOS memory responsibilities to Hermes Hindsight.
trigger: Use when managing durable memory, curation boundaries, or mapping LifeOS memory concepts to Hermes Hindsight.
---

# Memory — LifeOS File-Memory → Hermes Hindsight

## Purpose

This skill replaces the retired LifeOS file-system memory runtime (`MutationTier.ts`, `MemoryReviewer`, `MemoryGraph.ts`, and related TypeScript tooling) with **Hindsight** as the canonical associative-memory layer. There is no file-tree memory in Hermes. Hindsight provides `recall`, `retain`, and `reflect` operations that map directly to the LifeOS memory responsibilities. The TypeScript tools are not ported as runtime code; their *responsibilities* are mapped to Hermes-native equivalents.

## Mutation Tier Mapping

The LifeOS four-tier mutation system maps to Hermes layer boundaries:

| LifeOS Tier | LifeOS Behavior | Hermes Equivalent | Hindsight Tags | document_id Pattern |
|---|---|---|---|---|
| **A** (auto set-overwrite) | `PRINCIPAL_MEMORY.md`, `DA_MEMORY.md` — direct overwrite | `hindsight_retain` with set-replace semantics | `cat:identity`, `cat:telos` | `user:{id}:identity:principal`, `user:{id}:config:operational_rules` |
| **B** (logged append) | `PROJECTS.md`, `CONTACTS.md`, `KNOWLEDGE/`, `IDEAS/` — append with log | `hindsight_retain` with unique document_id per item | `cat:entity`, `cat:knowledge` | `user:{id}:project:{slug}`, `user:{id}:entity:person:{slug}`, unique per item |
| **C** (propose-only) | identity, style, definition, resume, operational-rules — require approval | Cognitive-graph capture + `hindsight_retain` after explicit user confirmation | `cat:identity`, `durability:core` | `user:{id}:identity:principal`, `user:{id}:wisdom:{domain}` |
| **D** (untouchable) | Credentials, config, code — never auto-modified | Files outside Hermes memory scope — never auto-retain | — | — |

## Curation Coverage

| LifeOS Curated File | Hermes Destination | Trigger | Cadence |
|---|---|---|---|
| `PRINCIPAL_MEMORY.md` | Hindsight `cat:identity` + `cat:telos` | Explicit user fact or TELOS update | On change |
| `DA_MEMORY.md` | SOUL.md + Hindsight `cat:identity` | Agent identity update | On change |
| `PROJECTS.md` | Hindsight `cat:knowledge` + `project:` tag | Project creation/update | On change |
| `CONTACTS.md` | Hindsight `cat:entity` | New contact / update | On change |
| `KNOWLEDGE/` | Hindsight `cat:knowledge` | Learning event | On change |
| `IDEAS/` | Hindsight `cat:knowledge` + Amber routing | Amber capture | On capture |
| `LEARNING/` | Hindsight `cat:learning` | Session completion, failure | On completion |
| `WISDOM/` | Hindsight `cat:wisdom` | Explicit `hindsight_reflect` synthesis | On request, or through a separately approved cron template |
| `RELATIONSHIP/` | Hindsight `cat:identity` | Relationship context update | On change |
| TELOS summary | Hindsight `cat:telos` with `source:configured_telos` | Principal-approved projection from the configured source | Explicit refresh |
| ISA sync | Workspace/ISA files (NOT Hindsight) | Phase transition | Per-ISA |
| Security | Hermes security logs (NOT Hindsight) | Event-driven | Continuous |
| Observability | Hermes LCM + session logs (NOT Hindsight) | Built-in | Continuous |
| TELOS source files | the configured TELOS source in `LifeOS/install/HERMES.md` | Manual / cron refresh | As needed |
| Credentials | Never touched | — | — |
| Code | Git repository | — | — |

## Memory Operations

The upstream MemoryReviewer cadence (8 turns / 30 min / 2 idle → reviewer subprocess) is **not** installed. Hermes may have its own configured memory provider, but the HALOS plugin registers no recall, retain, review, health, or synthesis lifecycle hooks.

| Phase | LifeOS | Hermes | Mechanism |
|---|---|---|---|
| **Recall** | `LoadMemory` + `MemoryDeltaSurface` | Retrieve relevant durable context | Invoke `hindsight_recall` when the configured provider is available and the task warrants it |
| **Retain** | `MemoryReviewFire` | Promote durable facts from the turn | Invoke `hindsight_retain` deliberately under the mutation/consent rules below |
| **Reflect** | `MemoryReviewer` subprocess | Synthesize patterns | Invoke `hindsight_reflect` explicitly; any recurring job requires separate principal approval |
| **Session switch** | Manual flush | Transcript/session continuity | Hermes/LCM handles its own session state; HALOS performs no Hindsight flush hook |

Key difference: HALOS supplies routing doctrine and stable identifiers, not an invisible cadence. LCM session context and Hindsight durable memory remain distinct; neither proves that Hindsight facts were injected into a turn.

**Critical:** Pass the richest useful conversation content to `retain`. Do not pre-summarize or pre-distill sessions before retaining. Hindsight extracts facts itself; raw content is not stored verbatim as memory.

## Proposal Subtypes

LifeOS proposal subtypes map to Hermes cognitive-graph and Hindsight destinations:

| LifeOS Proposal Kind | Hermes Destination | Confirmation Required | Hindsight Tags |
|---|---|---|---|
| `identity` | Cognitive-graph `value`/`identity` node + Hindsight | Yes — explicit user confirmation | `cat:identity`, `durability:core` |
| `style` | SOUL.md update + Hindsight | Yes — SOUL.md is identity | `cat:identity` |
| `definition` | Hindsight with stable document_id | Yes | `cat:knowledge` |
| `canonical-content` | Hindsight | Yes | `cat:knowledge` |
| `resume` | Hindsight | Yes | `cat:identity`, `durability:core` |
| `operational-rule` | SOUL.md or constitution + Hindsight | Yes | `cat:identity` |
| `projects` | Hindsight with `project:` tag | No (Tier B) | `cat:knowledge` |
| `contacts` | Hindsight with entity document_id | No (Tier B) | `cat:entity` |

## Directory Inventory Mapping

| LifeOS `MEMORY/` Subdir | Hermes Equivalent | What Lives There |
|---|---|---|
| `KNOWLEDGE/` | Hindsight `cat:knowledge` | Distilled ideas, research, architectural decisions |
| `WORK/` | Hermes workspace / ISA files (NOT memory) | Active work state and evidence |
| `LEARNING/` | Hindsight `cat:learning` | Session learnings, failure postmortems, fixes |
| `WISDOM/` | Hindsight `cat:wisdom` + optional approved synthesis job | Domain frames, cross-cutting principles, mental models |
| `RELATIONSHIP/` | Hindsight `cat:identity` | Relationship context and history |
| `OBSERVABILITY/` | Hermes LCM + session logs (NOT Hindsight) | Context receipts, compression, transcript continuity |
| `SECURITY/` | Hermes security logs (NOT Hindsight) | Security event logs |
| `STATE/` | Hermes session/workspace state (NOT Hindsight) | Live session state, work registries |
| `VOICE/` | Hermes TTS plugin logs (NOT Hindsight) | TTS output logs |

## What NOT to Put in Hindsight

These belong in Hermes session, workspace, or logging layers — **never** in Hindsight:

- **Active task state** — ISA checklists, phase state, `work.json`-style live state
- **Pending approval/proposal queues** — Hermes orchestration layer manages these
- **Tool telemetry** — tool activity logs, cost logs, security JSONL streams
- **High-frequency observability events** — event firehoses that would flood memory
- **Pre-summarized session content** — pass rich content to `retain`; let Hindsight extract

## Cross-references

- **`LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md` §5** — shipped memory-boundary doctrine (reference; not automatically loaded)
- **`PORT_SCHEMAS/hindsight_memory_schema.md`** — Full Hindsight bank layout, tag taxonomy, document_id strategy, operation triggers
- **`PORT_SCHEMAS/hook_mapping.md`** — MemoryTurnStart, MemoryReviewFire, MemoryHealthGate, WorkCompletionLearning hook mappings
- **Freshness skill** — A-F staleness grading for TELOS and identity files
- **Amber skill** — Idea capture and preservation loop (routes ideas into Hindsight)
- **Conduit skill** — Current-state sensing (feeds daily record into Hindsight)

## Configuration Notes

- The importer does not select or configure a memory provider. Inspect the chosen Hermes profile and verify Hindsight health before depending on recall or retain.
- With principal approval, configured TELOS may be projected to Hindsight as `document_id: "user:{id}:telos"`, tags `["cat:telos", "cat:identity", "durability:core", "source:configured_telos"]`. The source files remain canonical; no automatic loader or file watcher is installed.
- A `lifeos-wisdom-synthesis` cron is an optional design, not an installed job. If separately approved and created, it may call `hindsight_reflect` and optionally retain reviewed output as `cat:wisdom` with `document_id: "user:{id}:wisdom:synthesized"`.

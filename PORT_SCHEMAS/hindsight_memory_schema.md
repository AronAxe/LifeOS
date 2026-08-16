# Hindsight Memory Schema for LifeOS→Hermes Port

> **Status:** portable design and migration guidance, not evidence that an instance has a healthy Hindsight provider, an enabled cron job, or automatically retained conversation data. Verify those claims against the target Hermes installation.

## Correction Log
- **Fixed:** Do NOT pre-distill/pre-summarize sessions before `retain`. Hindsight best practices say pass the richest representation available (raw conversation JSON preferred). Hindsight extracts facts itself; raw content is not stored verbatim as memory.
- **Fixed:** Session retain should send rich conversation/session content, not a lossy 3-bullet summary.
- **Kept:** Single user bank, stable document_ids for living records, tag taxonomy, keep active state/telemetry/proposals OUT of Hindsight.

---

## 1. Bank Layout

### `user_{user_id}` (primary)
Store: preferences, identity, project knowledge, learnings, failures/postmortems, domain wisdom, contacts/entities, approved operational rules.

Do NOT store: active task state, pending approvals, telemetry logs, raw JSONL event firehoses, ISA checklist progress.

### `hermes_system_reference` (optional, skip if not needed yet)
Shared non-user-specific technical memory: Hermes quirks, tool contracts, framework gotchas.

---

## 2. Tag Taxonomy

### `cat:` — core category
- `cat:identity` — durable user/agent identity, voice, style, operational rules
- `cat:telos` — long-term goals, mission, values, baselines
- `cat:entity` — people, companies, tools, hardware profiles
- `cat:knowledge` — distilled ideas, research, architectural decisions
- `cat:learning` — session learnings, failure postmortems, fixes
- `cat:wisdom` — domain frames, cross-cutting principles, mental models

### `domain:` — subject area
- `domain:engineering`, `domain:workflow`, `domain:finance`, `domain:health`, `domain:security`

### `project:` — project scoping
- `project:lifeos-port`, `project:hermes`, `project:visit`

### `source:` — provenance
- `source:direct_user`, `source:session_harvest`, `source:post_mortem`, `source:subagent`

### `durability:` — optional, defer for MVP
- `durability:core`, `durability:dynamic`, `durability:episodic`

---

## 3. document_id Strategy

### Stable/upserted (reuse same ID → Hindsight replaces old facts)
- `user:{id}:identity:principal`
- `user:{id}:config:operational_rules`
- `user:{id}:entity:person:{slug}`
- `user:{id}:project:{slug}`
- `user:{id}:wisdom:{domain}`

### Immutable/event-like (unique ID per event)
- `user:{id}:session:{session_id}`
- `user:{id}:failure:{failure_id}`

---

## 4. Operation Triggers

### `recall`
- **Turn start**: recall identity + relevant project/domain tags → inject into context
- **Domain query**: recall `domain:{query_domain}` AND (`cat:knowledge` OR `cat:wisdom`)

### `retain`
- **Explicit user fact/rule statement**: retain immediately with `cat:identity`, `source:direct_user`
- **Session/task completion**: retain using **rich conversation/session content** (NOT pre-summarized). Tags: `cat:learning`, `source:session_harvest`. document_id: `user:{id}:session:{session_id}`
- **Failure/postmortem**: retain with `cat:learning`, `source:post_mortem`. document_id: `user:{id}:failure:{failure_id}`
- **Approved identity/rule change** (after proposal approval): retain with `cat:identity`, `durability:core`

### `reflect` (async, periodic)
- Failure pattern synthesis: reflect over `cat:learning` + `domain:{domain}`
- User profile/preferences synthesis
- Domain wisdom consolidation
- Optionally retain reflection output back under `cat:wisdom`

---

## 5. Keep OUT of Hindsight

- Active ISA/task progress, `work.json`-style live state
- Pending approval/proposal queues (Hermes orchestration layer)
- Telemetry: tool activity logs, cost logs, security JSONL streams
- High-frequency observability event firehoses

These belong in Hermes session/workspace/logging, not memory.

---

## 6. Portable Implementation Contract

### Hermes capabilities to verify on the target profile
- A configured Hindsight provider may expose `hindsight_recall`, `hindsight_retain`, and `hindsight_reflect`.
- Hermes/LCM may provide transcript and session continuity independently of durable memory.
- Provider auto-recall, auto-retain, extraction missions, tags, document modes, and session-switch behavior are version- and profile-specific. Inspect live configuration and read back real results before relying on them.

### What this portable release configures
- **Nothing in the principal's memory plane.** The importer does not edit `config.yaml`, create a Hindsight config, choose a bank, enable auto-retain, migrate document IDs, project TELOS, or create cron jobs.
- The schema below supplies portable tag and `document_id` conventions using `user:{id}:...` placeholders.
- `InstallSettings.ts` does not map memory-provider settings.

### Optional, separately consent-gated operations
1. Select and verify the principal's memory provider and bank.
2. Review provider extraction/retention settings against the current Hermes documentation and privacy requirements.
3. Project configured TELOS only after approving the canonical source, target bank, tags, and principal identifier.
4. Create a synthesis or TELOS-refresh cron only after approving schedule, model/provider cost, delivery, and write behavior.
5. Migrate any pre-existing person-specific document IDs through an instance-local plan; never preserve a former principal's identifier as a portable default.

---

## 7. Identity Mapping (LifeOS → Hermes)

### DA_IDENTITY.md → SOUL.md
LifeOS stores agent identity in `USER/DIGITAL_ASSISTANT/DA_IDENTITY.md` (loaded at session start via CLAUDE.md `@` import). The Hermes-native equivalent is `$HERMES_HOME/SOUL.md` — always loaded when present, independent of cwd, sets agent identity (not project rules).

- **LifeOS source**: `LifeOS/install/USER/DIGITAL_ASSISTANT/DA_IDENTITY.md` (template — "INTERVIEW REQUIRED")
- **Hermes target**: `$HERMES_HOME/SOUL.md` (principal-owned agent identity, personality, voice, relationship, autonomy, and working rules)
- **Status**: installation-time configuration. Do not ship an identity-specific SOUL.md in a portable release.

### PRINCIPAL_IDENTITY.md → Hindsight
LifeOS stores principal identity in `USER/PRINCIPAL/PRINCIPAL_IDENTITY.md` (template — "INTERVIEW REQUIRED"). The Hermes-native equivalent is Hindsight retain under `cat:identity` + `cat:telos`.

- **LifeOS source**: `LifeOS/install/USER/PRINCIPAL/PRINCIPAL_IDENTITY.md` (template)
- **Hermes target**: Hindsight, tags `["cat:telos", "cat:identity", "durability:core", "source:configured_telos"]`
- **Status**: installation-time configuration. Retain only after the provider is healthy and the principal approves the source content and identifiers.

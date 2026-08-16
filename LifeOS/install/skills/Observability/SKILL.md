---
name: observability
description: Map LifeOS observability to Hermes-native evidence.
trigger: Use when reasoning about system observability, event logging, session state tracking, or mapping LifeOS observability infrastructure to Hermes-native equivalents.
---

# Observability — LifeOS Event Pipeline → Hermes-Native Mapping

## Purpose

Observability is the raw sensory feed behind the upstream Life Dashboard—tool calls, agents, and failures as inspectable events. Hermes exposes session, context, process, and tool evidence through several native surfaces, but they are not one complete LifeOS event ledger. This skill maps what can be inspected and names the gaps.

## Architecture → Hermes

The LifeOS observability system was a single-source local event pipeline: JSONL files on disk → Pulse reads on demand → dashboard polls every 3s. No event bus, no in-memory queue, no push.

In Hermes, the architecture is inverted — the runtime itself is the observer:

| LifeOS Layer | Hermes Equivalent |
|---|---|
| JSONL event files (`MEMORY/OBSERVABILITY/*.jsonl`) | LCM session database + Hermes tool execution logs |
| Retired local Pulse events API | `lcm_status`, `lcm_inspect`, `session_search` |
| Observatory Next.js dashboard (polls every 3s) | Hermes desktop app (chat, terminal, sessions panes) |
| `EventLogger.hook.ts` (PostToolUse catch-all → JSONL) | Hermes built-in tool logging |
| Read-on-demand from disk | Read-on-demand from LCM/session DB |

## Event Sources → Hermes

| LifeOS Event Source | JSONL Path | Hermes Equivalent | Port? |
|---|---|---|---|
| Tool activity | `tool-activity.jsonl` (100 entries) | Hermes tool execution tracking (built-in) | Yes (native) |
| Tool failures | `tool-failures.jsonl` (50) | Hermes error logs (built-in) | Yes (native) |
| Voice events | `voice-events.jsonl` (50) | Hermes TTS plugin logs | Yes (native) |
| Subagent events | `subagent-events.jsonl` (50) | Hermes `delegate_task` lifecycle tracking | Yes (native) |
| Agent watchdog | stdout (Monitor) | Hermes `process(action='poll')` + `delegate_task` status | Yes (native) |
| ISA rework | `isa-rework.jsonl` | ISA iteration count in workspace ISA.md | Yes (in ISA) |
| Frame drift | `frame-drift.jsonl` | Not ported | No |
| Reviewer runs | `reviewer-runs.jsonl` | Explicit `hindsight_reflect` result, if separately recorded | Partial; no HALOS reviewer hook |
| Reviewer fires | `reviewer-fires.jsonl` | No automatic turn-end retain | No |
| Memory writes (Tier A) | `memory-writes.jsonl` | Explicit Hindsight operation/result; provider logging is deployment-specific | Partial |
| Tier-B writes | `tier-b-writes.jsonl` | Explicit Hindsight operation/result; provider logging is deployment-specific | Partial |
| Pending proposals | `pending-proposals.jsonl` | Conversation/workspace state until the principal decides | Manual; not cognitive-graph memory |
| Identity proposals | `identity-proposals.jsonl` | Conversation/workspace state; promote only after confirmation | Manual |
| Proposal replies | `proposal-replies.jsonl` | Not needed. Confirmations happen in chat. | No |
| Memory retrievals | `memory-retrievals.jsonl` | Explicit recall result; provider logging is deployment-specific | Partial |
| Config changes | `config-changes.jsonl` | Inspect the actual config and repository/audit evidence | Manual; no HALOS audit hook |
| Effort routing | `effort-router.jsonl` | **Retired** 2026-07-11. No successor. | No |

## Event Format → Hermes

LifeOS events conformed to the `LifeosEvent` interface:
```typescript
interface LifeosEvent {
  timestamp: string;    // ISO-8601
  session_id: string;   // Claude Code session ID
  source: string;       // "tool-activity" | "tool-failure" | "voice" | "subagent"
  type: string;         // Event type
  [key: string]: unknown;
}
```

Hermes does not use a custom event interface. LCM stores messages with role, timestamp, session_id, and content natively. Tool calls and results are tracked as structured message entries in the session database.

## Read Timing

| LifeOS | Hermes |
|---|---|
| Pulse polls `/api/events/recent` every 3s | LCM and session DB are always current — no polling |
| Each request reads JSONL tails from disk | `lcm_status`, `lcm_inspect`, `session_search` query the DB directly |
| No persistent in-memory cache | LCM manages its own cache internally |

## Session State Tracking → Hermes LCM

LifeOS tracked session state in `MEMORY/STATE/work.json` with atomic read-modify-write. Multiple hooks wrote to it:

| LifeOS Writer | Hermes Equivalent |
|---|---|
| `SessionAnalysis.hook.ts` (UserPromptSubmit → upsertSession) | Hermes session start — LCM creates session entry |
| `EventLogger.hook.ts` (PostToolUse → bumpLastToolActivity) | Hermes tool execution — LCM records tool calls |
| `ISASync.hook.ts` (syncToWorkJson) | Hermes workspace ISA.md sync |
| `ISAAutoName.hook.ts` (updateSessionNameInWorkJson) | Hermes session naming (automatic) |

### Display Lanes

| LifeOS Lane | Hermes Equivalent |
|---|---|
| `starting` (new algorithm session) | Hermes session in progress |
| `native` (non-algorithm session) | Hermes session (all sessions are equal) |

### Staleness

| LifeOS | Hermes |
|---|---|
| 5 min native, 10 min algorithm | LCM session lifecycle manages this natively |
| `Math.max(updatedAt, lastToolActivity)` for self-healing | LCM handles session continuity natively |

## Observatory Dashboard → Hermes Surface

| Observatory Component | LifeOS URL | Hermes Equivalent |
|---|---|---|
| Agents page | `/agents` | Hermes sessions pane + `session_search` |
| Knowledge browser | `/knowledge` | `hindsight_recall` with `cat:knowledge` |
| Security page | `/security` | Hermes tool approval (no separate UI) |
| Freshness | `/freshness` | `python LifeOS/install/skills/Freshness/Tools/check.py` |
| Growth | `/growth` | Hindsight `cat:identity` + explicit reflection; any synthesis cron requires separate approval |
| Life (USER/ browser) | `/life` | `hindsight_recall` with category tags |

## What NOT to Recreate

These upstream components should not be recreated blindly. Use the named Hermes surface where it covers the need, and state the limitation where it does not:

- **JSONL event files** — Hermes has LCM and built-in logging
- **Pulse HTTP API** — Hermes has `lcm_status`, `lcm_inspect`, `session_search`
- **Next.js Observatory dashboard** — Hermes desktop app is the surface
- **EventLogger hook** — Hermes logs tool execution natively
- **AgentWatchdog** — Hermes `process(action='poll')` handles this
- **work.json session state** — LCM session database handles this
- **FreshnessCache** — Freshness is queried on demand via `check.py`

## What TO Observe in Hermes

The DA should use these Hermes-native observability tools:

| Need | Tool |
|---|---|
| Current session health | `lcm_status` |
| Session metadata and frontier | `lcm_inspect` |
| Search past sessions | `session_search(query="...")` |
| Read a specific session | `session_search(session_id="...")` |
| Check background process status | `process(action='poll')` or `process(action='list')` |
| Check TELOS/identity file staleness | `python LifeOS/install/skills/Freshness/Tools/check.py` |
| Recall durable facts | `hindsight_recall(query="...")` |
| Synthesize patterns | `hindsight_reflect(query="...")` |
| LCM diagnostics | `lcm_doctor` |

## Design Principles (Preserved)

These LifeOS observability design principles apply equally to Hermes:

1. **Read-on-demand.** Don't push events; pull them when needed. Hermes tools (`lcm_status`, `session_search`) follow this pattern.
2. **Fire-and-forget.** A failed observation should never block work. Hermes logging is non-blocking.
3. **Single source.** LCM is the canonical session context store. Hindsight is the canonical durable memory. Do not duplicate.
4. **Crash-isolated where evidence exists.** Do not claim an event survived unless its actual native or plugin store can be read back.
5. **No notification fatigue.** Most events resolve to nothing. Observe to steer, not to narrate.

## Cross-references

- **`LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md`** — §6 reference doctrine for LCM, Hindsight, and cognitive-graph boundaries; not automatically loaded
- **Pulse skill** — Daemon architecture and dashboard mapping
- **Notifications skill** — Event log channel and notification routing
- **Memory skill** — Hindsight as canonical memory (reviewer runs/fires map here)
- **Freshness skill** — A-F staleness grading
- **`LifeOS/install/LIFEOS/DOCUMENTATION/Observability/ObservabilitySystem.md`** — Source of truth (do not modify)

# Conduit — Cron Specs

These are optional Hermes cron templates for deterministic local scripts. They are not installed automatically: capture consent, the schedule, model/provider cost, and any Hindsight write must be approved by the principal before creation.

## Job 1: `conduit-capture` (every 2 minutes)

Runs one poll of the enabled adapters, appends events to `$HERMES_HOME/conduit/events.jsonl`. Deterministic — no agent, no model.

| Field | Value |
|-------|-------|
| **name** | `conduit-capture` |
| **schedule** | every 2 minutes (`*/2 * * * *`) |
| **deliver** | `local` |
| **enabled_toolsets** | `["terminal", "file", "memory"]` |
| **no_agent** | `true` (pure script — no LLM needed) |
| **script** | `python "$HERMES_HOME/skills/conduit/Tools/capture.py"` |

Create through the documented Hermes cron interface only after approval.

## Job 2: `conduit-rollup` (daily at midnight)

Builds the deterministic daily record from the day's events and writes `daily/{date}.{md,json}`. When `LIFEOS_PRINCIPAL_ID` is configured, it may retain the record to Hindsight using `cat:conduit`, `source:conduit_daily`, and `document_id: user:{id}:conduit:daily:{date}`. The record-building core is deterministic; retain is an optional external write.

| Field | Value |
|-------|-------|
| **name** | `conduit-rollup` |
| **schedule** | daily at 00:00 (`0 0 * * *`) |
| **deliver** | `local` |
| **enabled_toolsets** | `["terminal", "file", "memory"]` |
| **no_agent** | `true` (deterministic rollup — no LLM needed) |
| **script** | `python "$HERMES_HOME/skills/conduit/Tools/rollup.py"` |

Create through the documented Hermes cron interface only after approval.

## Notes

- **Missed midnight is fine.** If the machine is off at 00:00, the rollup fires on next boot. `rollup.py` targets a specific date and is idempotent — re-running overwrites the same `daily/{date}.{md,json}` and re-retains the same stable `document_id`, so no duplication.
- **`memory` toolset on `conduit-rollup`** is required because `rollup.py` performs the Hindsight retain (via the `hermes` CLI; a durable `retain-queue.jsonl` fallback catches the record if the CLI is unavailable).
- **Privacy.** Both jobs are `deliver: local`; all data stays under `$HERMES_HOME/conduit/`. Disable any source in `config.json` (`appFocus`/`git`/`hermesSession`), or set `enabled: false` as the kill switch.
- **Path variable.** Confirm the cron runner's environment expansion and working directory before creation; do not substitute a maintainer-specific absolute path into a portable release.

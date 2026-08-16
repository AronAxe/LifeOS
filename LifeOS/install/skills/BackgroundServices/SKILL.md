---
name: background-services
category: LifeOS
description: >
  Use when inspecting, designing, or operating recurring HALOS work on Hermes.
  Maps the upstream service registry to live Hermes cron and process state without
  claiming that optional jobs are installed.
---

# Background Services — Hermes Operator Contract

## Current installation contract

The HALOS importer creates **zero scheduled jobs** and starts **zero background processes**. It installs skill content and, only when separately selected, the native `lifeos` plugin payload. Every recurring job remains an explicit principal decision.

Inspect reality before recommending a change:

1. Use `cronjob(action="list")` for scheduled Hermes work.
2. Use `process(action="list")` for processes launched through Hermes.
3. Inspect the relevant native service manager when a process is owned outside Hermes.
4. Treat documentation and configuration as intent, not proof that a service is healthy.

Do not create, remove, pause, or resume a job merely because an upstream LifeOS service existed. Present the schedule, side effects, delivery target, cost, and rollback first; obtain the principal's decision; then use the documented Hermes tool.

## Upstream model retained as reference

LifeOS used a macOS-only service registry plus `launchd`. Its key design principle was **one human-readable catalog, live runtime state**: metadata explained each service, while `launchctl` and plist inspection supplied ground truth.

Hermes distributes those concerns:

| Upstream concern | Hermes-native mechanism | Installation status |
|---|---|---|
| Scheduled registry | `cronjob(action="list")` | Native, live |
| Create or remove scheduled work | `cronjob(action="create"|"remove")` | Native; explicit approval required |
| Pause or resume scheduled work | `cronjob(action="pause"|"resume")` | Native; explicit approval required |
| Agent-launched process state | `process(action="list")` | Native, live |
| Long-lived OS service | Native service manager plus health checks | Optional adapter |
| Dashboard/runtime extension | Hermes plugin | `lifeos` payload is installed separately and disabled by default |

There is no deployed `Services.ts` command and no HALOS service-registry file. Do not invent either path.

## Capability ledger

| Upstream service | Hermes route | Status |
|---|---|---|
| Pulse dashboard and menu-bar app | Hermes WebUI/Desktop plus optional `lifeos` dashboard tab | Replaced; plugin must be explicitly enabled |
| Conduit capture and insight builder | Self-contained script or plugin plus approved cron job | Optional; not installed |
| Periodic synthesis | A self-contained cron prompt using Hindsight reflection | Optional; not installed |
| Work or commitment sweep | A self-contained cron prompt with explicit delivery | Optional; not installed |
| Recording-inbox watcher | Native service or bounded watchdog script | Optional adapter; not supplied |
| Derived-file synchronization | Source-specific adapter | Unsupported by the base installation |
| Health synchronization | Source-specific adapter plus approved cron job | Optional adapter; not supplied |
| Codex updater | Provider-specific maintenance | Unsupported by HALOS core |
| Blog discovery | Self-contained cron prompt | Optional; not installed |
| Usage aggregation | Hermes/provider telemetry where available | No HALOS aggregator installed |
| Bookmark pipeline watchdog | Source-specific adapter | Optional adapter; not supplied |
| Repository backups | Repository-native backup procedure or approved scheduled script | External operational concern |
| Amber routing | Self-contained skill/script plus approved cron job | Optional; not installed |

`PORT_SCHEMAS/hook_mapping.md` is the authoritative implementation ledger. A row marked optional or mapped there is not evidence of a live job; only `cronjob(action="list")` establishes that.

## Creating a Hermes job

Before mutation, define:

- the self-contained prompt or deterministic script;
- schedule and timezone assumptions;
- skills and toolsets required;
- cost and external side effects;
- delivery destination;
- idempotence and duplicate suppression;
- failure alerting;
- rollback (`cronjob(action="remove", job_id=...)`).

After explicit approval, create the job with `cronjob(action="create", ...)`, list it again, and—when safe—run it once with `cronjob(action="run", job_id=...)`. Verify the delivered result rather than inferring success from registration alone.

## Safety boundaries

- Never guess a job ID; list first.
- Never translate a macOS cadence blindly. Confirm timezone, resource use, and delivery behavior.
- Cron runs have no current-chat context; prompts must be self-contained.
- Cron-run sessions must not create more cron jobs.
- Use script-only `no_agent` mode only when the script itself emits the exact final message.
- A listener or process entry is not an end-to-end health check.

## Cross-references

- `PORT_SCHEMAS/hook_mapping.md` — authoritative installed/manual/optional ledger
- **Conduit**, **Amber**, **Memory**, **Observability**, and **Pulse** skills — subsystem doctrine
- Hermes documentation — authoritative cron, process, plugin, and service behavior

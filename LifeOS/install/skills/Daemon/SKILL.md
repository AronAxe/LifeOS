---
name: Daemon
version: 2.0.0
description: "Manage a consent-gated public profile from principal-supplied LifeOS sources. Aggregate approved fields, apply deterministic redaction, preview changes, and optionally publish through an explicit adapter. Use for daemon profile, public profile, preview daemon, update daemon, or publish daemon."
effort: medium
---

# Daemon

## What It Does

Builds a public-profile document from a principal-supplied LifeOS source tree. The skill can inspect source availability, aggregate explicitly approved material, preserve manually curated sections, apply deterministic redaction, preview a diff, write an approved local artifact, and invoke an optional publisher adapter.

It does **not** infer a personal source tree, choose public material on the principal's behalf, configure hosting, create repositories, publish automatically, or claim a bundled Cloudflare/MCP deployment.

## Capability Contract

| Capability | Implementation |
|---|---|
| Source inventory | `Tools/DaemonAggregator.ts --sources` |
| Aggregate and sanitize | `Tools/DaemonAggregator.ts --preview` or `--json` |
| Compare with current artifact | `Tools/DaemonAggregator.ts --diff <daemon.md>` |
| Write approved artifact | `Tools/DaemonAggregator.ts --output <daemon.md>` |
| Publish through external infrastructure | `Tools/PublishAdapter.ts --input <daemon.md>` |
| Content filtering | `Tools/SecurityFilter.ts` plus structural source exclusions |

All write and publish operations require explicit approval. Preview and source inventory are read-only.

## Required Configuration

`LIFEOS_DIR` must point to the principal-supplied LifeOS source tree. There is no home-directory fallback.

Publication selection is fail-closed:

| Variable | Meaning |
|---|---|
| `LIFEOS_DAEMON_PUBLIC_MISSION_IDS` | Comma-separated mission IDs approved for publication, such as `M1,M3` |
| `LIFEOS_DAEMON_PUBLIC_GOAL_IDS` | Comma-separated goal IDs approved for publication |
| `LIFEOS_DAEMON_PUBLIC_PROJECTS` | Comma-separated project names approved for publication |
| `LIFEOS_DAEMON_PUBLIC_SECTIONS` | Optional source groups: `identity,books,movies,wisdom,ideas,work-themes` |

An existing `<LIFEOS_DIR>/USER/Daemon/daemon.md` is treated as manually curated input. Newly derived source groups remain empty unless selected above.

Optional publication configuration:

| Variable | Meaning |
|---|---|
| `LIFEOS_DAEMON_PUBLISH_ADAPTER` | Absolute executable path for the publisher |
| `LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS` | Optional JSON array of fixed adapter arguments |
| `LIFEOS_DAEMON_STATUS_URL` | Optional live URL used by the read workflow |

The publisher receives `--input <absolute-path>` and, for a dry run, `--dry-run`. It is launched without a shell and must report its own destination and verification evidence.

## Workflow Routing

| Workflow | Trigger | File |
|---|---|---|
| Update | "update daemon", "refresh public profile" | `Workflows/UpdateDaemon.md` |
| Read | "read daemon", "daemon status" | `Workflows/ReadDaemon.md` |
| Preview | "preview daemon", "daemon diff" | `Workflows/PreviewDaemon.md` |
| Deploy | "publish daemon", "deploy daemon" | `Workflows/DeployDaemon.md` |

## Source Model

The aggregator understands the upstream LifeOS layout beneath `LIFEOS_DIR`:

- `USER/TELOS/` or `USER/TELOS/TELOS.md`
- `MEMORY/KNOWLEDGE/Ideas/`
- `MEMORY/WORK/`
- `USER/PROJECTS/PROJECTS.md`
- `USER/PRINCIPAL_IDENTITY.md`
- `USER/Daemon/daemon.md`
- `USER/SKILLCUSTOMIZATIONS/Daemon/SecurityOverrides.md`

Sensitive categories including contacts, finances, health, business material, traumas, private current/ideal-state data, people, and companies are structurally excluded before content filtering.

## Security Rules

1. Private by default. A plausible public field is still private until selected.
2. Deterministic filtering is mandatory for every generated document.
3. Preview the exact output before any write.
4. Review the written artifact again before publication.
5. Publication is a separate explicit action through the configured adapter.
6. `--no-filter` is diagnostic only and must never feed a write or publish step.
7. Missing source data remains missing; do not invent profile content or defaults.

## Verification

A successful update requires evidence for all applicable stages:

1. `--sources` identifies configured and missing inputs.
2. `--diff` or `--preview` shows the exact candidate content and redactions.
3. After approval, `--output` returns the written path and byte count.
4. Read back the local file and verify no prohibited content appears.
5. If publishing, run the adapter and verify the destination independently using its returned URL or ID.

No successful local write implies successful publication. No successful adapter exit implies the public destination actually changed without a destination read-back.

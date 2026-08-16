---
name: interview
version: 2.0.0
category: LifeOS
portable: true
description: >
  Use for a context or TELOS check-in. Reads the principal's configured sources
  before asking, prioritizes stale or incomplete sections, and applies only
  approved edits while preserving stable IDs and provenance.
---

# Interview — Context-Aware Principal Check-In

## Purpose

Refresh constitutional and directional context without making the principal repeat what is already on file. Staleness is a review signal, not a failure state.

HALOS does not install an interview scanner, freshness daemon, Pulse route, summary generator, or automatic context loader. This skill operates on sources the principal has configured and authorized.

## Routing

| Condition | Workflow |
|---|---|
| A configured TELOS/context corpus exists and contains substantive material | `Workflows/ContextCheckin.md` |
| The principal wants to establish a new TELOS source or the configured source is empty | `Workflows/Phase0Setup.md` |
| No source is configured and the principal has not asked to create one | Explain the limitation and ask where the source should live; do not guess |

## Core rules

- Resolve the configured TELOS/context path. Never use a maintainer-specific or invented default.
- Read existing context before asking questions.
- Ask “still right?” rather than treating age as error.
- Prefer one salient item at a time; preserve stop signals such as “enough,” “later,” or “stop.”
- Typed IDs remain stable when edited or retired. New entries receive the next available ID.
- A proposed edit is not an approved edit.
- Show the exact target and intended change before writing.
- Verify every approved write by reading the target back.
- Do not update freshness metadata when content did not change.
- Do not create background jobs, summaries, memories, or notifications unless separately requested and approved.

## Freshness model

Use evidence available in the configured source:

1. section-level `last_reviewed` or `last_updated` metadata when present;
2. source-control history when available and relevant;
3. file modification time as a weaker fallback;
4. explicit “unknown” when no trustworthy timestamp exists.

Do not insert metadata merely to make the freshness display work. When an approved edit lands, preserve the file's existing metadata convention or propose one explicitly.

## Completion

Report:

- sources inspected;
- sections reviewed;
- approved changes written and verified;
- unchanged or deferred items;
- unresolved source or freshness limitations.

The conversation may end cleanly with no writes.

## Related skills

- **Telos** — direct TELOS reads and updates
- **Freshness** — general review and staleness policy
- **Migrate** — intake of existing external content
- **ISA** — interview against a bounded ideal-state artifact
- **Containment** — private/public boundary checks

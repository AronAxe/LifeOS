---
task: "Build the CMUX skill — cmux as the unified LifeOS agent cockpit"
slug: cmux-skill
project: CMUX
effort: E5
phase: build
progress: 0/28
mode: algorithm
started: 2026-07-07
updated: 2026-07-07
principal_stated_goal: "switch to CMUX and implement all of our cool features, plus all the features that he talks about, into a new upgraded CMUX experience"
principal_stated_goal_source: prompt
principal_stated_goal_signal: 4
principal_stated_goal_locked: 2026-07-07
density_score: 0.62
interview_invoked: true
divergence_risk: low
density_gate_acknowledged: true
context_checks_fired: [observe-density, observe-sufficiency, e5-interview]
context_sufficient: true
frame_drift: pending
---

# ISA — CMUX skill

## Problem

LifeOS orchestrates agents three ways today — in-harness subagents (`Agent`/`Task`/`Workflow`), the remote Mac-mini fleet over SSH, and Kitty tab-state for at-a-glance status — but none give a single **programmatically-driveable, fully-visible cockpit** where every agent (LifeOS's own AND hands-on coding teams) can be seen, prompted, and steered at agent speed. Kitty tabs show state but can't be scripted into team layouts; subagents are black boxes you can't jump into mid-run; the fleet is SSH windows with no shared surface. The source video's thesis lands: *an agent you can't see is an agent you can't improve.* cmux (installed, `~/.local/bin/cmux`, v0.62.2) is a Mac-native terminal multiplexer with a real send/read/open-close control API — the missing cockpit — but nothing in LifeOS wraps it.

## Vision

`Skill("CMUX")` boots a named cmux workspace of agents in one command — a tiered team, an N-agent race, a grid, or remote SSH panes — and drives them through the send/read loop. The monitor emits classified JSON state. Interactive speech uses Hermes `text_to_speech`; unattended notification requires explicit `CMUX_NOTIFY_ENDPOINT`. No dashboard, provider hook, phase, or memory integration is implicit.

## Out of Scope

- Ripping out the working Kitty tab-state hooks THIS session (staged in DESIGN.md Phase 3 — never modify working features unprompted).
- Dashboard or SSE ingestion of live cmux state.
- Linux/tmux fallback implementation (cmux is Mac-only; noted as a design risk, not built).
- Modifying Hermes UI, TTS configuration, phase doctrine, model routing, or memory.
- Building cmux itself or forking it.

## Principles

- **An agent you can't see is an agent you can't improve** — visibility is the point; every recipe leaves agents observable and jump-into-able.
- **Programmatic access = agent speed** — every capability is a scriptable subcommand, not a GUI click.
- **Wrap, don't reinvent** — build on cmux's real CLI and (if present) `claude-teams`; the wrapper stays thin.
- **Public-clean by construction** — no private identity/hosts in the shipped skill; private specifics live in USER config.
- **Poll, don't pretend** — cmux exposes no event stream; the monitor honestly polls, and says so.

## Constraints

- Bun-always, TypeScript-always. No `just` (recipes are bun subcommands).
- cmux is a Mac GUI app; socket exists only while running; wrapper must auto-launch.
- Socket auth via `CMUX_SOCKET_PASSWORD`/`--password`/Settings.
- Public skill (`TitleCase`): zero real hosts/IPs/identity; `~/` not absolute user home paths.
- Notification is optional and fail-closed through explicit `CMUX_NOTIFY_ENDPOINT`; no dashboard, hook, Algorithm, or memory contract is installed.
- Never modify working features unprompted — Kitty hooks stay live until an explicit cutover.

## Dependencies

- optional: notification-adapter — explicit HTTP(S) `CMUX_NOTIFY_ENDPOINT`; omitted by default
- requires: cmux-binary — `~/.local/bin/cmux` v0.62.x with the documented command surface
- requires: fleet-config — the CMUX USER customization dir holds `fleet.json` (optional; mini-fleet degrades to `--hosts`)

## Goal

Ship a public `CMUX` skill whose `Tools/cmux.ts` wrapper drives real cmux through the send/read/open-close loop; provide recipes for tiered teams, agent races, named fleets, and remote SSH panes; emit classified monitor state; and keep notification behind an explicit adapter. Dashboard, hook, phase, and memory integrations are outside this skill. Live-driving requires verification against a real macOS cmux workspace.

## Criteria

- [ ] ISC-1: `skills/CMUX/Tools/cmux.ts` exists and `bun cmux.ts --help` prints usage, exit 0
- [ ] ISC-2: `cmux.ts` type-checks clean (`bun build --target bun` or `tsc --noEmit`, zero errors)
- [ ] ISC-3: `cmuxExec` auto-launches the app on "Socket not found" then retries (code path present + proven by a live cold-start)
- [ ] ISC-4: `send --surface <ref> "<t>" --enter` types text AND submits (Enter) — round-tripped via `read`
- [ ] ISC-5: `read --surface <ref>` returns screen text as `{ok,text}` from a live surface
- [ ] ISC-6: `boot-team --name --tiers` creates a live workspace with a lead pane + worker column, returns surface refs
- [ ] ISC-7: `race --feature --agents N` opens N labeled surfaces in one workspace
- [ ] ISC-8: `fleet --name --grid 2x2` creates a live 2×2 grid
- [ ] ISC-9: `mini-fleet` reads fleet config (or --hosts) and opens one SSH pane per host; NO hardcoded hosts in the file
- [ ] ISC-10: `monitor --once` polls surface-health + read-screen and classifies each surface idle|working|done|awaiting-input
- [ ] ISC-11: `monitor` reports done/awaiting transitions and records notification success/failure when an adapter is configured
- [ ] ISC-12: `flash --workspace <ref>` triggers a visible flash on a live workspace
- [ ] ISC-13: `voice "<msg>"` fails closed without `CMUX_NOTIFY_ENDPOINT` and reports adapter delivery when configured
- [ ] ISC-14: `list`/`tree` returns parsed JSON topology of a live cmux instance
- [ ] ISC-15: Flat comms — one agent surface can `cmux send` a prompt to another surface, proven by read-back
- [ ] ISC-16: `SKILL.md` present with valid frontmatter (name CMUX, description with USE WHEN + NOT FOR), routing table, Gotchas, Examples
- [ ] ISC-17: Four Workflows exist: BootTeam.md, AgentRace.md, Fleet.md, Monitor.md
- [ ] ISC-18: `DESIGN.md` maps all 10 video features → wrapper mechanism + status
- [ ] ISC-19: `DESIGN.md` maps all LifeOS features (Pulse, voice, Algorithm, routing, fleet, memory, Kitty) → keep/replace/bridge
- [ ] ISC-20: `DESIGN.md` specifies the staged Kitty→cmux terminal-layer replacement with reversibility per phase
- [ ] ISC-21: Public-clean — the release identity/host deny-list grep over `skills/CMUX/` returns zero matches
- [ ] ISC-22: Anti: the skill does NOT edit/remove any Kitty tab-state hook this session (working features untouched)
- [ ] ISC-23: Anti: no recipe hardcodes a private host/IP/credential
- [ ] ISC-24: Anti: `send` without `--enter` never silently claims the prompt ran (must require Enter to submit)
- [ ] ISC-25: Antecedent: a live cmux instance is running (auto-launched) before any live-driving ISC is probed
- [ ] ISC-26: Live end-to-end — one real recipe (boot-team or fleet) is driven against live cmux and screenshot/tree-verified
- [ ] ISC-27: Advisor consulted before `phase: complete`; verdict recorded
- [ ] ISC-28: Forge audit-mode pass (E5 cross-vendor) run in VERIFY; verdict recorded

## Test Strategy

| isc | type | check | threshold | tool | anchors_to |
|-----|------|-------|-----------|------|------------|
| ISC-1 | bash | `bun cmux.ts --help` exit 0 | usage printed | bash | literal |
| ISC-2 | bash | typecheck | 0 errors | bun build/tsc | literal |
| ISC-3 | manual | cold-start auto-launch | app comes up | bash+cmux ping | literal |
| ISC-4..15 | bash | live-drive each subcommand | ok:true + read-back | bun cmux.ts + cmux read-screen | literal |
| ISC-16..17 | manual | files + frontmatter | present/valid | Read | literal |
| ISC-18..20 | manual | design coverage | all rows present | Read | literal |
| ISC-21,23 | bash | deny-list grep | 0 matches | rg via containment-zones | derived: public-cleanliness |
| ISC-22 | bash | Kitty hooks unchanged | git diff empty on hooks | git | derived: no-regress |
| ISC-24 | manual | send-without-enter semantics | no false submit-claim | Read code | derived: honesty |
| ISC-26 | screenshot | live recipe render | workspace visible | screencapture + cmux tree | literal |
| ISC-27,28 | manual | advisor + Forge verdicts | recorded | Inference/Agent | derived: verification-doctrine |

## Features

| name | satisfies | depends_on | parallelizable | intelligence |
|------|-----------|------------|----------------|--------------|
| wrapper cmux.ts | ISC-1..15,24 | — | yes | max |
| workflows | ISC-17 | wrapper | yes | high |
| design doc | ISC-18..20 | — | yes | max |
| skill.md | ISC-16 | wrapper | no | high |
| event grounding | ISC-10,11 | — | yes | high |
| live verification | ISC-3..15,25,26 | wrapper | no | high |
| public-clean + audit | ISC-21..23,27,28 | all | no | max |

## Historical upstream decisions

The entries below explain the source design chronology. They are not installed runtime contracts; the Hermes-port disposition in the active sections above supersedes them.

- D-1: The upstream build chose a unified terminal cockpit and a terminal-layer-only migration. HALOS preserves the cockpit, not the upstream service stack.
- D-2: Direct parallel agents over a full Workflow — build has a sequential spine (scaffold→fill→live-verify) and live cmux GUI driving must stay in the main loop. Delegation floor ≥4 met (Forge build + 2 general-purpose + CodexResearcher).
- D-3: Kitty→cmux hook cutover STAGED, not done this session — ripping out working hooks unprompted violates "never modify working features." DESIGN.md Phase 3.
- D-4: Public skill → fleet hosts read from USER config, never hardcoded. Socket password from env.
- D-5: `model:fable` on Agent dispatch currently executes Opus (logged harness downgrade) — E5 delegates run Opus in fact; Forge/CodexResearcher run their own vendor.
- D-6: Upstream research identified provider-specific cmux lifecycle hooks. HALOS does not install them; the portable wrapper polls cmux state.
- D-7: PLAN-REFRESH. Socket is DEFAULT-DENY ("only processes started inside cmux can connect"). Wrapper's "auto-launch then drive from outside" fails without auth. Two supported paths: run orchestrator INSIDE a cmux surface (inherits `CMUX_SOCKET_PATH`), or set a Settings socket password → `CMUX_SOCKET_PASSWORD`. Wrapper must detect the auth wall and surface it, not silent-fail. ISC-3 auto-launch is necessary-but-insufficient; add auth-mode handling.
- D-8: The upstream design proposed provider hooks and session-JSON ingestion. HALOS rejects both as implicit contracts; cmux remains an optional macOS terminal dependency.

## Changelog

- conjectured: cmux exposes no event stream, so monitoring must poll `surface-health`+`read-screen` (written into CONTRACT + first SKILL.md gotcha).
- refuted_by: Upstream research found provider-specific lifecycle hooks, but those do not constitute a portable Hermes interface.
- learned: cmux is default-deny on the socket; run inside a cmux surface or configure `CMUX_SOCKET_PASSWORD` deliberately.
- criterion_now: the Hermes port uses explicit polling, performs no session-JSON ingestion, and keeps notification behind `CMUX_NOTIFY_ENDPOINT`.

## Verification

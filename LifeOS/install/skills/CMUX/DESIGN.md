# CMUX — migration + integration design

## Verdict

Switching to cmux provides **programmatic control of the terminal itself** — send text into any pane, read the screen back, and open or close surfaces over a socket. cmux is Mac-only and has no portable event stream, so `monitor` uses an explicit poll loop. The Hermes port confines itself to terminal control and classified JSON state. It does not install the upstream Pulse, voice-server, hook, Algorithm, or memory integrations.

## What cmux is

cmux is a **Mac GUI terminal app** (`com.cmuxterm.app`) you drive over a Unix socket. The socket only exists while the app runs; `cmux <path>` opens a directory and launches the app if it isn't up. Auth is a socket password from `--password`, `CMUX_SOCKET_PASSWORD`, or Settings.

The mental model is a four-level tree:

```
window ⊃ workspace ⊃ pane ⊃ surface
```

- **window** — an OS window.
- **workspace** — a named tab-group. Our convention: **one workspace per agent-team**.
- **pane** — a split region inside a workspace.
- **surface** — a tab inside a pane. A surface is either a **terminal** or an **in-app browser**.

The whole point is the **send / read / open-close loop**:

- `cmux send --surface <ref> "<text>"` types into a surface.
- `cmux send-key --surface <ref> Enter` submits it (send alone often doesn't run — you round-trip through read to confirm).
- `cmux read-screen --surface <ref>` reads the screen back.
- `cmux new-surface` / `close-surface` / `new-pane` open and close.

Two facts shape everything downstream. **Mac-only**: no Linux path, which matters for the remote fleet. **Poll, not event**: there is no subscribe command. "Agent finished" is discovered by polling `surface-health` + `read-screen` and matching idle/done markers. We design the monitor as a poll loop, full stop.

## Feature map — HIS features (the source video) → how we implement

Every wrapper subcommand below is `bun ~/.claude/skills/CMUX/Tools/cmux.ts <subcommand>`.

| # | Feature (his) | cmux mechanism | Our wrapper subcommand | Status |
|---|---------------|----------------|------------------------|--------|
| 1 | Programmatic agentic access (send/read/open-close) | `send` + `send-key` + `read-screen` + `new/close-surface` | `send`, `read` | staged |
| 2 | Three-tier orchestration (orchestrator→leads→workers) | one workspace, panes split lead-left / worker-column-right | `boot-team --tiers orchestrator,lead,worker,worker` | staged |
| 3 | Flat bidirectional comms (any agent prompts any agent) | `send` targets any surface ref by role | `send --surface <role-ref>` | staged |
| 4 | Agent-race / needle-in-haystack (first to solve wins) | N surfaces in one workspace, each running the launch cmd | `race --feature <f> --agents N` | staged |
| 5 | Fleet boot (2x2, named 8-agent teams) | grid of panes, one cmd per cell | `fleet --name <n> --grid 2x2 --cmds "a;b;c;d"` | staged |
| 6 | One-tap team boot (his `just fast cc`) | recipe wrapping new-workspace + splits | `boot-team` / `race` (bun recipes; no `just`) | staged |
| 7 | Notify / idle events → orchestrator | poll `surface-health`, classify, report transition | `monitor` JSON + optional explicit notification adapter | staged |
| 8 | Per-workspace color / identity / banner / flash | `themes`, `workspace-action`, `trigger-flash` | `flash`; themes via `boot-team` | staged |
| 9 | In-app browser beside the agent | `new-pane --type browser --url <url>` | `boot-team` browser pane option | staged |
| 10 | Reusable session files | cmux persists sessions; our recipes are the reusable boot | recipes = `boot-team`/`race`/`fleet` | staged |

His build system is `just`; we have no `just` and we are bun-always. So `just fast cc <feature>` becomes `bun cmux.ts boot-team` / `race`. Same outcome, our toolchain.

## Feature map — OUR features (LifeOS) → how they survive under cmux

| Our feature | Today | Under cmux | Keep / replace / bridge |
|-------------|-------|------------|-------------------------|
| Upstream Pulse dashboard | SSE and work.json registry | Not installed; `monitor` emits JSON for an approved consumer | **optional adapter only** |
| Spoken notification | Upstream local voice server | Interactive Hermes uses `text_to_speech`; unattended CLI requires `CMUX_NOTIFY_ENDPOINT` | **replace / opt in** |
| Upstream Algorithm / ISA hooks | Claude hooks write phase to work.json + tab | Not installed; CMUX reports surface state only | **not ported** |
| Model routing | Upstream provider-specific tiers | Launch command remains under principal control | **external** |
| Remote Mac-mini fleet | three hosts over SSH, names in USER config | `mini-fleet` opens one SSH pane per host | **keep** + bridge |
| Memory / learning capture | Upstream stop-hook harvesters | No automatic capture from CMUX | **not ported** |
| Kitty tab-state | Upstream hooks paint Kitty tabs | Historical migration context only | **not installed** |

The load-bearing boundary is narrower: CMUX owns terminal surfaces and emits observations. Dashboard ingestion, speech, phase tracking, and durable memory are separate capabilities. They remain separate unless a principal explicitly configures and approves an adapter.

## The replacement, precisely

The principal chose **replace the terminal layer only**. Here is the exact cut line.

**What gets replaced** — the Kitty tab-state painter:

- `hooks/PromptProcessing.hook.ts` (SessionAnalysis consolidated in) — paints working/completed/error onto the Kitty tab.
- `hooks/TabState.hook.ts` (absorbed SetQuestionTab 2026-07-11) — paints the awaiting-input (bold caps) state.
- `hooks/handlers/TabState.ts` — the Stop-time final-state detector.
- `hooks/lib/tab-setter.ts` — the `kitten @ set-tab-*` calls, `setModeToken`, `setPhaseTab`.

These drive Kitty tab **color / icon / title** to show agent state (working / completed / awaiting / error) plus the `N` / `E1..E5` mode-token owned by `TheRouter.hook.ts`. Under cmux the same signals map to surface-level equivalents: `rename-tab` for the title+token, `trigger-flash` for attention, `workspace-action` / `themes` for color-by-state.

**What remains outside this port:**

- Hermes UI, LCM, Hindsight, routing, and phase doctrine are not modified by CMUX.
- No upstream Pulse service, voice server, Claude hook, work.json bridge, or automatic memory capture is installed.
- An interactive agent may call Hermes `text_to_speech`; the standalone wrapper only uses an explicitly supplied `CMUX_NOTIFY_ENDPOINT`.

**Why the cutover must be staged.** The Kitty hooks work today and are wired through a subtle single-authority contract: `TheRouter` owns the token, `PromptProcessing` owns the description, `AlgoPhase` + `ISASync` own the phase, each preserving the other's field. Ripping that out and repointing four hooks at an immature, poll-only, Mac-only target in one move is how you get a session with no visible state and no idea which layer broke. The safe path keeps both painters alive — Kitty and cmux writing in parallel — until the cmux path is proven across working, completed, awaiting, error, and every phase transition. Then Kitty is removed. A hook that paints state is cheap to run twice and expensive to get wrong once.

## Phased rollout

**Phase 0 — skill + wrapper (this session).**
Ships: the `CMUX/` skill, `Tools/cmux.ts` implementing the wrapper contract (ping, send, read, boot-team, race, fleet, mini-fleet, monitor, list/tree, flash, voice), auto-launch, and env/USER-config for fleet hosts + socket password.
Risk: low — nothing existing changes; the wrapper is additive.
Reversible: fully — delete the skill dir.

**Phase 1 — recipes in daily use.**
Ships: `boot-team` and `race` used by hand for real coding-agent teams; `mini-fleet` for the remote hosts. No hook changes yet.
Risk: low — cmux runs alongside Kitty; the two don't collide.
Reversible: fully — stop invoking the recipes.

**Phase 2 — optional reviewed integration.**
Possible future work: consume `monitor` JSON in a separately reviewed Hermes adapter, or configure `CMUX_NOTIFY_ENDPOINT` for unattended transition notifications.
Risk: medium — polling cost, classifier false positives, and unintended data egress.
Reversible: high — leave the endpoint unset and stop the external consumer.

**Phase 3 — upstream-only migration concept.**
The original design proposed a Kitty-to-cmux hook cutover. HALOS does not install those Claude/Kitty hooks and performs no cutover. A future platform adapter would require its own implementation, tests, approval, and rollback.

**Phase 4 — mini-fleet panes + browser cockpit.**
Ships: `mini-fleet` as the standing fleet view (one SSH pane per host), plus agent+browser side-by-side panes (`new-pane --type browser`) for flows that need a live page next to the agent.
Risk: medium — depends on cmux SSH-pane stability and the browser surface maturing.
Reversible: high — these are additional panes, not replacements.

## Risks & open questions

- **Mac-only.** cmux has no Linux build. The local cockpit is Mac, fine. But the remote fleet is reached *over SSH into* cmux panes — cmux runs on the Mac, the panes hold SSH sessions to the hosts, so the hosts themselves never need cmux. Confirm we never assume cmux on the far side. Any future Linux workstation is a Kitty-or-nothing fallback, which argues for keeping the Kitty painter removable-but-recoverable.
- **Maturity / flakiness.** cmux is young (v0.62.2) and the source video showed a stalled orchestrator. Treat every recipe as needing a health check and a manual-recovery path. Don't build anything load-bearing on top until Phase 1 has logged real uptime.
- **Socket auth.** The socket only exists while the app runs, and auth is a password from env or Settings. The wrapper must auto-launch, poll `ping` to ~15s, and fail loud if the password is missing — never silently run unauthenticated. The password lives in env / USER config, never in the public Tools file.
- **Poll cost of `monitor`.** No event stream means polling `surface-health` + `read-screen`. Too tight burns CPU and may produce noisy transitions; too loose delays detection. The interval is explicit (default ~3s).
- **No native event stream — done-detection is heuristic.** We infer idle/done/awaiting from prompt strings and screen markers, which are brittle across shells and agent CLIs. Round-trip verification (send → read-back) is the only reliable confirm; bake it into `send --enter` and into `monitor`'s transition logic.
- **Send-without-submit gotcha.** `send` types but often doesn't run — a `send-key Enter` is required, and the only proof it ran is `read-screen`. Every recipe that submits a prompt round-trips to confirm rather than assuming.

---

**Status:** design only. Phase 0 (skill + `Tools/cmux.ts`) is the buildable unit; everything past Phase 1 is staged and gated on cmux proving out in daily use.

## Advisor risk addenda (2026-07-07 — E5 commitment-boundary review)

Sharp risks the first pass under-priced. Fold into the phase work before the Kitty cutover.

**Integration spine (build-on-claude-teams + session-JSON bridge):**
- **Session JSON is a private, uncontracted interface.** cmux does not promise that schema. The Hermes port does not ingest it. Any future adapter must pin a supported version and fail loudly on schema drift.
- **Torn reads.** Reading `session-*.json` while cmux writes it yields partial JSON. Parse-failure → bounded retry, never crash.

**Upstream hook collision:** the original design could produce duplicate events across cmux, Claude Code, LifeOS, and Kitty hooks. Those hooks are not installed by the Hermes port. A future event adapter must still define deduplication before activation.

**Kitty→cmux cutover blind spots:**
- **Liveness inversion.** cmux is a GUI app whose socket dies on quit/crash. Monitoring must report socket loss explicitly rather than imply continued observation.
- **Identity mapping.** Anything in memory/Algorithm keyed to Kitty window/session IDs needs a mapping to cmux surface IDs, or Phase 3 orphans historical state.
- **Rehearsed rollback.** "Kitty hooks untouched" preserves the old path, but Phase 3 still needs a tested one-command rollback, not just an intact fallback.

**Security posture (conscious choice required):** setting a cmux socket password converts default-deny into *any local process holding the password can drive your agent fleet*. That is a real posture change — decide it deliberately, and the password must never land in the public skill (the grep passes now, but that is point-in-time).

**Verification honesty:** live-driving (boot-team/race/fleet/monitor) is offline-verified only; the `CMUX_SOCKET_PASSWORD` handshake code has never executed. Minimum bar before calling the cockpit proven: an authenticated `ping` + one `send`/`read` round-trip. Until then SKILL.md carries the "live-driving unproven" status.

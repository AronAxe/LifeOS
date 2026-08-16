---
name: Config
description: "Routes LifeOS configuration questions on Hermes across five distinct concerns — doctrine reference, config.yaml, SOUL.md, configured TELOS, and skills — without claiming an automatic merge or constitution loader. USE WHEN: configure, config, settings, preferences, operational rules, which config wins, where does this setting live, change a model, edit identity, vendor doctrine. NOT FOR active task state (workspace/ISA), durable facts (Hindsight), or the LifeOS settings.json merge machinery (retired on Hermes)."
effort: medium
---

# Config — Hermes-Native Configuration Layering

## What It Does

Answers "where does this setting live?" on Hermes. LifeOS on Claude Code merged `settings.system.json` + `settings.user.json` into a generated `settings.json` at SessionStart. **Hermes does not port that merge.** Hermes manages configuration natively through its own config system. HALOS uses the five concerns below as an ownership guide, not as an implemented loader, merge chain, or runtime precedence engine.

## The Problem

Config drift is silent and expensive: a model set in two places, an identity rule that contradicts an operational rule, a personal path leaking into a shared surface. The failure LifeOS solved with a physical system/user split is the same one here — keep the invariant OS separate from the individual life. HALOS addresses it by assigning each concern one authoritative home. When two active Hermes context sources conflict, inspect the actual runtime context and resolve the conflict deliberately; this skill does not invent a universal override order.

## The Five Layers

These are ownership domains, not an automatic resolution stack.

| # | Layer | Location | Owns | Editable? |
|---|-------|----------|------|-----------|
| 1 | **Doctrine reference** | `LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md` | Portable HALOS principles for deliberate adoption into an approved context | Yes, through a reviewed source change; not loaded automatically |
| 2 | **Profile** | `$HERMES_HOME/config.yaml` | Models, providers, tools, memory, gateway, delegation, cron | Yes — the primary user-editable config |
| 3 | **Identity** | `$HERMES_HOME/SOUL.md` | DA name, personality, voice, working rules, relationship framing | Yes |
| 4 | **TELOS** | Configured path supplied by the principal during setup | Canonical mission, goals, beliefs, strategies, current state | Yes (canonical source) |
| 5 | **Operational** | `$HERMES_HOME/skills/` | Installed skills, each carrying its own config/reference files | Yes (per skill) |

**Canonicality rules:**
- **TELOS is canonical for identity/goals.** Hindsight may hold a retained projection under `cat:telos`, but the configured source files win.
- **SOUL.md is canonical for DA behavior** — personality, voice, how the DA speaks and works.
- **The shipped constitution is reference doctrine.** The importer does not load or copy it into a system prompt. It governs a session only if the principal deliberately adopts equivalent rules through a supported Hermes context mechanism.
- **config.yaml is canonical for machinery** — model routing, tool availability, delegation limits, cron, gateway.

## What Does NOT Port

- **`settings.system.json` + `settings.user.json` → `settings.json` at SessionStart.** Retired. Hermes reads `config.yaml` natively; there is no generated merge file to guard against hand-editing.
- **`MergeSettings.ts` deep-merge driver.** Not ported — the layering above replaces it.
- **`LifeosConfig.ts` typed loader + `LIFEOS_CONFIG.toml`.** Hermes config is `config.yaml`; skills read their own reference files directly.
- **`SystemFileGuard.hook.ts` write-time enforcement.** Not ported as an automatic HALOS hook. Hermes tool approvals still apply, and the agent must confirm scope, destination, and reversibility before consequential mutation; that is guidance, not equivalent deterministic enforcement.
- **CLAUDE.md `@`-imports.** There is no replacement import chain. Hermes loads its own supported profile/project context; the HALOS constitution and configured TELOS are read only when the active workflow deliberately requests them and consent permits it.
- **Two-repo symlink sync + ShadowRelease's 14 gates.** These are LifeOS release/distribution machinery, out of scope for a running Hermes instance.

## Workflow Routing

There are no sub-workflows — this skill is a resolution guide. Route an edit to the layer that owns the concern:

| Change | Layer | File |
|--------|-------|------|
| Model / provider / tools / delegation limits / cron / gateway | Profile | `$HERMES_HOME/config.yaml` |
| DA name / voice / personality / working rules | Identity | `$HERMES_HOME/SOUL.md` |
| Mission / goals / beliefs / strategies / current state | TELOS | Configured principal-supplied TELOS source |
| Repo conventions / env paths / tool prefs / vendor doctrine | Operational | `$HERMES_HOME/skills/Config/OPERATIONAL_RULES.md` (see `OPERATIONAL_RULES.template.md`) |
| HALOS doctrine proposal | Doctrine reference | `LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md` (rare, reviewed; no automatic activation) |

## Gotchas

- **There is no `settings.json` to edit on Hermes.** If a request assumes the LifeOS merge (edit `settings.user.json`, regenerate at SessionStart), redirect it to `config.yaml`. The merge machinery is retired.
- **Do not infer precedence from the table number.** The concerns mostly partition cleanly—TELOS does not override a model choice. If two active context sources address the same concern, inspect the actual Hermes loading rules and ask for a decision when the conflict is material.
- **Never leak layer 3/4 content into a public artifact.** SOUL.md and TELOS are personal. The constitution's security rule binds here: no private identity data, private TELOS content, or local absolute paths in shared surfaces.
- **The operational-rules file is read by this skill, not `@`-imported.** It is a skill reference file. When a repo convention or vendor gotcha is relevant, read `OPERATIONAL_RULES.md`; do not expect it in the base prompt.
- **config.yaml is the machinery home, SOUL.md the behavior home — don't cross them.** A model choice is config; a personality rule is identity. Putting behavior in `config.yaml` or model routing in `SOUL.md` is the drift this layering prevents.

## Examples

### Example 1 — "which model does delegation use?"
Layer 2 (Profile). Read `delegation.*` in `$HERMES_HOME/config.yaml` (`model`, `provider`, `reasoning_effort`). Not SOUL.md, not TELOS.

### Example 2 — "change how the DA talks to me"
Layer 3 (Identity). Edit `$HERMES_HOME/SOUL.md`—personality, voice, working rules—only after the separate approval required for changing Hermes's operating context. It takes effect when Hermes next loads that profile context; no HALOS merge step exists.

### Example 3 — "add a Cloudflare deploy convention"
Layer 5 (Operational). Add it to `OPERATIONAL_RULES.md` (scaffolded from `OPERATIONAL_RULES.template.md`) under the vendor-specific section. This skill reads that file when the convention is relevant.

## Cross-References

- Source doctrine adapted: `LIFEOS/DOCUMENTATION/Config/ConfigSystem.md` (LifeOS system/user split + merge — the machinery that does NOT port)
- Doctrine reference: `LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md` (not loaded automatically)
- Identity layer: `SOUL.md` (Layer 3)
- Operational-rules template: `LifeOS/install/LIFEOS/OPERATIONAL_RULES.template.md`
- TELOS truth source: configured path supplied by the principal during setup (retained under `cat:telos`)
- Delegation config consumers: **Delegation** skill (`delegation.*` in `config.yaml`)

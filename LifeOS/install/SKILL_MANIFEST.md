# LifeOS Skill Portability Manifest for Hermes

This manifest is the public capability contract for `LifeOS/Tools/ImportSkills.ts`. Every public skill is installed. Direct Hermes mechanisms support the first group; the second group is backed by the deployable LifeOS Hermes plugin and explicit adapters. Upstream runtime differences are never a reason to remove user-visible capability.

## Public skills — direct Hermes paths

These skills use documented Hermes tools or direct portable implementations.

- **Algorithm** — Hermes work loop: observe, classify, recommend, human decision, implement, verify, learn.
- **Amber** — compatibility alias for Synapse capture; uses portable, principal-scoped Hindsight identifiers.
- **BackgroundServices** — historical launchd-to-Hermes-cron mapping; cron creation remains consent-gated.
- **CLI** — retired LifeOS CLI/pipeline doctrine mapped to Hermes terminal, scripts, and native scheduling.
- **Config** — Hermes configuration and TELOS-source boundary mapping.
- **Conduit** — deterministic local event rollup with explicit principal identity for optional Hindsight retain.
- **Containment** — portable-release and system/user-boundary doctrine.
- **Delegation** — Hermes `delegate_task` configuration and verified fan-out guidance.
- **Freshness** — TELOS staleness checks; requires a principal-supplied `TELOS_DIR`.
- **Memory** — LifeOS memory responsibilities mapped to Hermes built-in memory, Hindsight, and local source artifacts.
- **Notifications** — historical notification mapping to Hermes TTS, phone, and gateway mechanisms.
- **Observability** — historical event-pipeline mapping to Hermes LCM/session evidence.
- **Router** — retired LifeOS routing mapped to Hermes configuration and judgment.
- **Schema** — LifeOS user-directory schema mapped to Hermes-native destinations.
- **Security** — security doctrine mapped to documented Hermes boundaries; it does not claim unimplemented enforcement.
- **SkillSystem** — Hermes skill discovery, customization, and public/private release guidance.
- **Synapse** — Hermes-native capture, classification, and resurfacing doctrine.
- **Testing** — evidence-first verification and repository-native testing guidance.
- **Thesis** — LifeOS operating doctrine adapted to Hermes without a separate persistence or scheduler layer.
- **Tools** — LifeOS utility inventory mapped to Hermes tools, scripts, Hindsight/LCM, and skill promotion.

## Public skills — adapter-backed Hermes paths

The following capabilities are installed with the public skill body. Their upstream implementations used Claude Code, macOS services, Bun support trees, Pulse, CMUX, or source-local paths; the Hermes port supplies the equivalent through the LifeOS plugin, supported Hermes tools/plugins, or an explicit per-capability adapter. Configuration such as vendor credentials, a browser session, a scheduled job, or a publication destination remains an operator decision—not a capability deletion.

- **ApertureOscillation**
- **Aphorisms**
- **Apify**
- **ArXiv**
- **Art**
- **AudioEditor**
- **BeCreative**
- **BiasCheck**
- **BitterPillEngineering**
- **BrightData**
- **CMUX**
- **CliFirstArchitecture**
- **ContextSearch**
- **Council**
- **CreateCLI**
- **CreateSkill**
- **Daemon**
- **Evals**
- **ExtractWisdom**
- **Fabric**
- **FirstPrinciples**
- **Hardening**
- **Harvest**
- **HTML**
- **Ideate**
- **Interceptor**
- **Interview**
- **ISA**
- **IterativeDepth**
- **Knowledge**
- **LifeOS**
- **LocalIntelligence**
- **Loop**
- **Migrate**
- **Optimize**
- **PrivateInvestigator**
- **Prompting**
- **Pulse**
- **RedTeam**
- **Remotion**
- **Research**
- **RootCauseAnalysis**
- **Sales**
- **Science**
- **SystemsThinking**
- **Telos**
- **Trim**
- **Upgrade**
- **USMetrics**
- **Webdesign**
- **WorldThreatModel**
- **WriteStory**

## Private boundary

Directories whose names begin with `_` are principal-private by definition. `ImportSkills.ts` skips them unconditionally, whether or not this manifest is edited. Private skills, local preferences, credentials, and principal source files are never part of a portable release.

## Adapter readiness rule

For every adapter-backed capability, provide all of the following in the same review:

1. A documented Hermes-native execution path, with no undeployed private runtime root, Pulse, or launchd dependency.
2. Automated tests for the adapter and a portable-release scan with no new exception.
3. A clear statement of required configuration and consent boundaries.
4. A manifest move into **Public skills — direct Hermes paths** once it no longer needs the adapter layer.

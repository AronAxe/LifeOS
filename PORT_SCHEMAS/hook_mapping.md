# LifeOS to Hermes Capability and Hook Mapping

This document maps the upstream LifeOS hook/runtime inventory to the HALOS-on-Hermes release. It is an **implementation ledger**, not an aspiration list.

## Status vocabulary

| Status | Meaning |
|---|---|
| **Plugin evidence** | Implemented by `LifeOS/install/plugins/lifeos/` when—and only when—the principal enables that plugin. |
| **Hermes native** | Hermes has a related capability independently of HALOS. Importing HALOS does not configure or enable it. |
| **Manual adapter** | A shipped skill or deterministic script provides the behavior only when explicitly invoked. |
| **Consent-gated template** | Documentation describes an optional cron/job integration; the installer creates no job. |
| **Not installed** | No automatic equivalent is delivered. The upstream source may remain as non-deployed reference. |

“Related capability” does not mean semantic identity. A Hermes approval, session store, or cron facility must not be described as a ported LifeOS hook unless this release actually registers or configures the corresponding behavior.

## Verified installed surface

The importer copies 72 public skill bodies and the optional native plugin payload. It does not enable the plugin, apply settings, edit project/profile context, configure Hindsight, or create cron jobs.

When enabled, the plugin registers only:

| Registration | Implemented behavior |
|---|---|
| `on_session_start` | Append a minimal `hermes-session` evidence event containing session ID, platform, and model when supplied. No transcript, TELOS, or context injection. |
| `on_session_end` | Append a minimal `hermes-session-end` evidence event. No memory review, health gate, cleanup, or learning pass. |
| `post_tool_call` | Record the name of completed `lifeos_*` tools only. Arguments and tool output are not captured. |
| `lifeos_isa` | Explicit SQLite-backed ISA create/get/list/update operations. No automatic phase advancement. |
| `lifeos_events` | Explicit event recording and deterministic daily rollup. |
| `lifeos_public_profile` | Explicit sensitive-pattern redaction preview. It does not publish. |
| `lifeos_status` / `/lifeos` / `hermes lifeos status` | Read the plugin’s profile-local ISA/evidence status. |

## Legacy hook inventory

| Upstream hook/component | Upstream trigger | HALOS/Hermes mapping | Status | Automatic after import? |
|---|---|---|---|---|
| `Safety.hook.ts` | Permission request / post-web-tool | Active Hermes policy, approvals, and Security skill guidance | Hermes native + manual guidance | **No HALOS safety hook** |
| `PreToolGuard.hook.ts` | Before shell/write/edit | Hermes approval policy; agent scope/reversibility checks | Hermes native + manual guidance | No deterministic HALOS guard |
| `SystemFileGuard.hook.ts` | Before writes to system files | Approval/path review described by Config and Containment | Manual guidance | No write-time enforcement |
| `EgressClassGuard.hook.ts` | Before provider egress | Security/Router classification guidance | Manual adapter | No runtime egress interceptor |
| `ISASync.hook.ts` | After file writes | Explicit `lifeos_isa` update | Plugin evidence/tool | No filesystem synchronization |
| `ISARenderOnStop.hook.ts` | Turn stop | Explicit ISA rendering workflow where available | Manual adapter | No |
| `CheckpointPerISC.hook.ts` | ISA criterion change | Hermes checkpoints may be configured separately | Hermes native | No HALOS checkpoint configuration |
| `LoadContext.hook.ts` | Session start | Hermes loads its own supported profile/project context; configured TELOS and HALOS doctrine are read deliberately by workflows | Hermes native + manual adapter | No HALOS constitution/TELOS injection |
| `MemoryTurnStart.hook.ts` | User prompt submit | Configured Hindsight recall may be used explicitly or by its own provider integration | Hermes native/external | No HALOS recall hook |
| `MemoryReviewFire.hook.ts` | Turn stop | Explicit Hindsight retain/reflect after consent | Manual adapter | No turn-end retain |
| `MemoryHealthGate.hook.ts` | Session end | Provider-specific health check, run explicitly | Manual adapter | No |
| `LastResponseCache.hook.ts` | Turn stop | Hermes/LCM session continuity | Hermes native | Not installed by HALOS |
| `StopGates.hook.ts` | Turn stop | Testing/verification doctrine | Manual guidance | No completion middleware |
| `PostToolObserver.hook.ts` | Post-tool | Hermes tool loop plus agent judgment | Hermes native | No HALOS loop detector |
| `AgentInvocation.hook.ts` | Before/after agent spawn | Hermes delegation lifecycle | Hermes native | No HALOS interception |
| `TaskGovernance.hook.ts` | Task created | `delegation.*` configuration | Hermes native | Import changes no config |
| `SessionCleanup.hook.ts` | Session end | Operator/workflow cleanup where needed | Manual adapter | No |
| `WorkCompletionLearning.hook.ts` | Session end | Explicit reviewed Hindsight/cognitive-graph promotion | Manual adapter | No automatic promotion |
| `EventLogger.hook.ts` | Tool/config/stop events | Plugin logs only minimal session markers and `lifeos_*` tool names | Plugin evidence (partial) | Only after plugin enablement |
| `HookHealer.hook.ts` | Session start | Hermes plugin loader manages its own registrations | Hermes native | Upstream hook not ported |
| `IntegrityCheck.hook.ts` | Session end | Repository/runtime checks invoked explicitly | Manual adapter | No |
| `DocIntegrity.hook.ts` | Session end | Documentation review invoked explicitly | Manual adapter | No |
| `AlgorithmNudge.hook.ts` | Tool failure | Algorithm skill and ordinary error recovery | Manual guidance | No nudge middleware |
| `ReminderRouter.hook.ts` | User prompt submit | Hermes reminders/cron only when separately configured | Hermes native/template | No |
| `SatisfactionCapture.hook.ts` | User prompt submit | Explicit retention of feedback after review | Manual adapter | No classifier or retain hook |
| `ContextReduction.hook.sh` | Before shell | Hermes context engine | Hermes native | Upstream hook not ported |
| `TabState.hook.ts` | Ask/stop | None | Not installed | No |
| `PromptProcessing.hook.ts` | User prompt submit | Hermes chat UI provides its own state | Hermes native | No tab painting |
| `VoiceCompletion.hook.ts` | Turn stop | `text_to_speech` when deliberately invoked/configured | Hermes native | No automatic speech |
| `KittyEnvPersist.hook.ts` | Session start | None | Not installed | No |
| `UpdateCounts.hook.ts` | Session end | None | Not installed | No |
| `FormatGate.hook.ts` | Legacy/unregistered | None | Not installed | No |
| `DriftReminder.hook.ts` | Legacy/unregistered | Explicit review via Config/Freshness | Manual adapter | No |
| `com.lifeos.amberroute` | launchd every 30 minutes | `Amber/CRON.md` optional Hermes cron design | Consent-gated template | No job created |
| `com.lifeos.conduit` | launchd every 120 seconds | `Conduit/CRON.md` optional capture design | Consent-gated template | No job created |
| `com.lifeos.conduit.insight` | launchd hourly | `Conduit/CRON.md` optional rollup design | Consent-gated template | No job created |
| `ULWorkSync.hook.ts` | Session end | Private principal-specific behavior excluded by containment | Not installed | No |

## Capability mappings

### Tools, CLI, and containment

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| CLI-first doctrine / Arbol pipeline model | `CLI`, `CliFirstArchitecture`, native tools, and durable scripts | Manual skill guidance; no custom runner |
| Utility inventory | Direct Hermes tools selected for the task | Hermes native |
| Containment | `Containment` skill plus release review and the portable scanner | Manual/repository gate; no automatic write interceptor |
| Release private-surface scan | `LifeOS/Tools/PortableScan.ts` in this repository | Deterministic repository gate, not an installed background service |

### Config and delegation

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| Settings merge | `InstallSettings.ts` classifies source keys and can apply only two declared mappings after separate consent | Manual adapter; dry-run by default |
| System/user layering | Config skill ownership map | Guidance, not a runtime precedence engine |
| Constitution import | Shipped doctrine reference | Not installed into active context |
| Delegation model injection hook | `delegation.*` in the selected Hermes profile | Hermes native; importer does not modify it |

### ISA, Algorithm, and freshness

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| Seven-phase Algorithm doctrine | `Algorithm` skill | Manual doctrine; no state machine/middleware |
| ISA working state | `lifeos_isa` when plugin enabled | Explicit plugin tool |
| ISA auto-render/sync/checkpoint | Explicit workflows or repository tools | Not automatic |
| TELOS freshness grading | `Freshness/Tools/check.py` with required `TELOS_DIR` | Manual deterministic script |
| Pulse/statusline freshness | None | Not installed |

### Memory, schema, and thesis

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| Durable knowledge/entities/relationships | Configured Hindsight | External/native provider; HALOS does not configure or health-gate it |
| Reviewed decision architecture | Configured cognitive graph, if present | Optional external system; explicit promotion only |
| Turn-start recall / turn-end retain | Hindsight tools/provider behavior | Not registered by the HALOS plugin |
| Periodic synthesis | Optional principal-approved cron using `hindsight_reflect` | Consent-gated template; no job created |
| File-tree schema/indexer | `Schema` skill and explicit Hindsight mapping | Manual doctrine; no watcher |
| Thesis | `Thesis` skill | Reference doctrine |

### Pulse, notifications, observability, and background work

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| Pulse monolith | Separate Hermes gateway, plugins, tools, process and cron capabilities | No monolithic HALOS daemon; import configures none of them |
| Voice server | `text_to_speech` when configured/invoked | Hermes native |
| Telegram/other gateway | Hermes gateway configuration | Hermes native; separate setup |
| Observability dashboard/logs | Hermes/LCM inspection tools plus the optional plugin’s narrow evidence store | Hermes native + plugin evidence; not equivalent to all upstream telemetry |
| Notification routing | `send_message` / TTS after deliberate agent decision | Hermes native; no HALOS router |
| Background service registry | Hermes cron/process tools | Hermes native; HALOS ships only optional templates |
| LifeOS cron services | Skill `CRON.md` files | Consent-gated templates; installer creates zero jobs |

### Security and routing

| Upstream capability | HALOS/Hermes path | Delivery |
|---|---|---|
| Prompt-injection boundary | Active trusted policy plus Security skill guidance | No HALOS annotation hook |
| Tool permission gating | Hermes approval system | Hermes native |
| Egress-class routing | Security/Router judgment | Manual guidance; no runtime guard |
| Release deny list / hourly scanner | Portable repository scan plus explicit review | Repository gate only; no hourly job |
| Model routing | Selected profile/provider configuration | Hermes native; no HALOS classifier hook |

## Verification rule

A mapping may be upgraded to **Plugin evidence** or **automatic** only when all four are present:

1. implementing code in the release payload;
2. an actual registration/configuration path;
3. an executable test that produces the behavior; and
4. installation documentation that names the consent and activation step.

A skill description, a conceptual analogy, or a native Hermes feature by itself is not proof that HALOS installed the capability.

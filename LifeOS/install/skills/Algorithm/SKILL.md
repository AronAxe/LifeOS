---
name: Algorithm
description: "A Hermes-native manual execution doctrine. A seven-phase loop (OBSERVE, THINK, PLAN, BUILD, EXECUTE, VERIFY, LEARN) integrating safety boundaries, effort tiers, ISC quality gates, and verification doctrine. Turns a substantial request into a hill-climb and closes only on tool evidence. It is a working discipline and checklist, not an automated state machine. USE WHEN: substantial or multi-phase work, executing a task spanning multiple tools/sessions, or when clear decision boundaries (classify, recommend, human decision) are needed."
effort: high
---

# The Algorithm — Hermes Execution Engine

## Status and scope

This skill ports a portable working doctrine, not a retired runtime. It does **not** install automated phase transitions, turn-completion middleware, a scheduler, or an automatic second task-state machine. Hermes tools, the project workspace, and the principal's decisions remain authoritative. If the optional native `lifeos` plugin is installed, its explicit `lifeos_isa` operations may persist a bounded ISA working record under the selected Hermes home; that is opt-in tool state, not automatic workflow control. Effort tiers, quality gates, and verification remain self-enforced manual quality floors.

Use it when a request is consequential enough that the current state, desired result, decision, implementation, and verification should be visible. Keep trivial work trivial.

## The Seven Phases and Safety Boundaries

The core loop integrates the seven phases with portable safety boundaries (classify, recommend, human decision). These are a reasoning-and-execution contract, **not** a requirement to emit phase banners on every turn or a fixed number of tool calls.

| # | Phase | Purpose & Safety Integration | Hermes Evidence |
|---|---|---|---|
| 1 | **OBSERVE** | Establish current state, constraints, missing prerequisites. | Read relevant files, inspect live state. Use `hindsight_recall` only for durable context. |
| 2 | **THINK** | Identify the real problem, scope, risks. **Classify:** Distinguish fact from assumption. State the material ambiguity or safety boundary before acting. | Explicit reasoning in the workspace or session. |
| 3 | **PLAN** | Define ideal state and test strategy. **Recommend & Human decision:** Present the smallest sound course (including alternatives). Obtain approval for external communication, financial action, deletion, publishing, or consequential changes. | Written plan, explicit recommendation, and principal's approval. |
| 4 | **BUILD** | **Implement:** Make the narrowest coherent change that moves one claim toward true. End-to-end increments, not horizontal layers. | A focused diff, file edit, or code block. |
| 5 | **EXECUTE** | Run the relevant tools, integrations, and workflows conditionally based on *installed capabilities*. | Terminal commands, supported tool execution. |
| 6 | **VERIFY** | **Verify:** Test actual result with evidence of the right modality. No "should work". No result closes on intent alone. | Read-back, test output, live probe. |
| 7 | **LEARN** | **Learn:** Preserve only durable, evidence-backed lessons. | Hindsight for stable knowledge; workspace/session artifacts for active task state. |

## Effort Tiers (E1–E5)

Effort tiers set self-enforced **floors**, not ceilings—the minimum structure and thinking depth a run of that weight must clear. The principal's plain-language steering outranks the tier.

| Tier | Shape | Minimum Structure Floor | Thinking Floor |
|---|---|---|---|
| **E1** | Trivial / fast-path (<90s) | Goal, Criteria | Answer inline. |
| **E2** | Single-domain change | Problem, Goal, Criteria, Test Strategy | Brief explicit reasoning before building. |
| **E3** | Mid-size project | Vision, Constraints, Features, Goal, Criteria, Test Strategy | Extended thinking; surface risks and at least one alternative. |
| **E4** | Cross-cutting / high blast radius | Full structured breakdown across domains | Deep thinking; consider delegation or an independent second look. |
| **E5** | Maximum / mission-critical | Full structured breakdown + multi-pass review | Maximum thinking; an independent second look is the default. |

*Note: There is no automatic tier enforcement or automatic completeness gate. These are manual working disciplines.*

## ISC Quality Gates & ID Stability

Every Ideal State Criterion (ISC) that closes a claim must pass these gates as a self-enforced standard:

1. **Granularity.** One ISC = one atomic, binary, independently verifiable claim, naming the tool probe that falsifies it.
2. **Tier floor.** Required sections for the active tier are populated.
3. **Doctrinal minimums:**
   - **≥1 anti-criterion** (`Anti:` prefix) on the build itself—what must *not* happen.
   - **≥1 antecedent** (`Antecedent:` prefix) when the goal is **experiential** (art, design, content, anything that has to "land"). Verifiable goals don't need one.

**ID-Stability Rule:**
ISC IDs never re-number on edit.
- **Splits** become children: `ISC-7.1`, `ISC-7.2`.
- **Drops** become tombstones: `- [ ] ISC-N: [DROPPED]`. Never delete the line.
Never collapse the numbering.

## Verification Doctrine

**"Should work" is forbidden.** No claim closes without tool evidence of the right modality. Match evidence to the claim:

| Claim | Minimum Evidence |
|---|---|
| File or doc change | Read-back and diff review |
| Code change | Relevant test, type/build check, or direct execution |
| Command | Checked exit status and meaningful output |
| Config or service | Read-back plus the appropriate health/client check |
| Remote or published | Live probe and returned identifier or URL |
| Memory change | Successful retain plus recall/read-back |

If appropriate verification cannot be run, state **changed but unverified** and name what remains. Do not upgrade a documented intention into an implementation claim.

**Class sweep:** A defect recognized as an instance of a class does not close until one grep/glob enumerates every sibling, each fixed-and-verified or tombstoned: `CLASS-SWEEP: <class> — N siblings; M fixed, K tombstoned`.

## Minimal Working Record

Keep active task state out of durable Hindsight. For substantial work, use a Hermes-native minimal working-record model: a workspace, task, or project artifact (for example, a markdown file in the workspace or the active session). When the optional native `lifeos` plugin is installed and the principal chooses it, an explicit `lifeos_isa` record is also suitable for bounded ISA criteria and evidence; it does not advance itself. The working record must contain:

1. Current state and evidence.
2. Desired state and non-goals.
3. Decision/approval boundary.
4. Planned verification.
5. Result, evidence, and any unresolved limitation.

*Note: Recommendations that the principal has not accepted belong in this ephemeral work/review state, not Hindsight fact storage.*

## Workflow Routing & Decision Boundaries

Capabilities available to a run are strictly bounded by what is actually installed and present in the Hermes environment.

- **Do not assume a cognitive graph, custom skill, external service, MCP, browser, or agent exists** merely because legacy/upstream material mentions it. Check installed Hermes capabilities before relying on them.
- `delegate_task` is a supported bounded tool; use it with independent verification of its outputs.
- Hindsight tools (`hindsight_recall`, `hindsight_retain`) are for durable memory only, when configured and healthy.

## Ascent Labels

Historical Ascent terms (Traverse, Marking, Ascending, Anchoring, Camped, Cairn) may be used as optional, nonpersistent present-tense descriptions of visible work. They are derived labels only. Do not persist them as task state, schedule work from them, build a UI state machine around them, or treat them as a second lifecycle.

## Examples

### Example 1 — E2 single-domain feature (add a verify mode to a backup CLI)

1. **OBSERVE** — Read the CLI's arg parser and check if the backup format exposes a checksummable field.
2. **THINK** — Classify the problem: real issue is *silent* corruption. Write an anti-criterion: `Anti: --verify exits 0 on a truncated archive`.
3. **PLAN** — Recommend ISCs: `ISC-1 --verify recomputes checksum and compares`, `ISC-2 mismatch → non-zero exit`. Wait for human decision if required.
4. **BUILD & EXECUTE** — Smallest change to implement the feature. Run tests.
5. **VERIFY** — Grep the diff, run the suite, verify exit code + output.
6. **LEARN** — Record the verification evidence in the workspace artifact. Retain durable lessons in Hindsight if applicable.

### Example 2 — E1 fast-path (add a `--no-color` flag)

- No ceremony: inline direct-write a minimal Goal + Criteria, make the change, Grep the flag is wired, run `tool --no-color | cat` to confirm no escape codes. Done in one pass.

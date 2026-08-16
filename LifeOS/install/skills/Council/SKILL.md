---
name: Council
version: 1.2.0
description: "Use for collaborative multi-perspective deliberation: custom topic-briefed members debate for three visible rounds or give a one-round quick check, preserving genuine disagreement and ending in a decision-oriented synthesis. Not for a pure adversarial attack; use RedTeam for that."
effort: high
context: fork
---

# Council

Council convenes distinct topic-specific perspectives, makes them respond to one another's actual arguments, and returns the visible transcript plus a synthesis. It avoids the flat “pros and cons” failure mode by giving every member a real stance, domain lens, and burden of proof.

## Routes

| Request | Workflow |
|---|---|
| Full deliberation with positions, rebuttals, and final judgments | `Workflows/Debate.md` |
| Fast single-round perspective check | `Workflows/Quick.md` |
| Pure attack or exploit search | RedTeam skill |

## Member construction

Write each member as a concise brief containing:

- name and relevant expertise;
- initial stance or decision criterion;
- what the member will defend, challenge, and demand evidence for;
- voice constraints only when they improve analytical separation.

Use four members by default: builder, skeptic, pragmatist, and evidence analyst, each adapted to the topic. Replace these slots when another perspective would create more productive friction. See `CouncilMembers.md`.

## Hermes execution

Run members with the Hermes `delegate_task` tool. Use its `tasks` array for work that can proceed independently, passing each child a complete `goal`, `context`, and `role: "leaf"`. Respect the active concurrency limit; if four members exceed one batch, split the round into the smallest possible bounded batches without changing prompts or leaking earlier same-round answers.

Rounds are sequential because later rounds depend on the prior transcript. Members need not retain hidden state: every new task receives the original member brief, topic context, and the complete prior transcript.

## Core guarantees

- Distinct briefs, not four copies of one generic role.
- Parallel execution within each dependency-free round; sequential execution between rounds.
- Visible attribution for each member's answer.
- Explicit convergence, remaining disagreement, assumptions, and decision criteria.
- No forced consensus. A stable unresolved trade-off is a valid result.
- No provider-specific model or agent type is required.

## Output

Use `OutputFormat.md` and `RoundStructure.md` where helpful. A complete full council contains:

1. topic and member roster;
2. Round 1 positions;
3. Round 2 responses to named arguments;
4. Round 3 final judgments;
5. parent synthesis with convergence, disagreement, recommended path, risks, and next evidence needed.

## Boundaries

The skill does not automatically send voice notifications, write execution logs, read a hidden customization tree, persist transcripts, or choose a paid model. Use principal-supplied context and approved evidence only. Do not include secrets or unnecessary personal data in delegated briefs.

## Completion

Council is complete when every requested perspective returned or is marked failed, later rounds demonstrably engage with prior arguments, the transcript is visible, and the synthesis distinguishes agreement from unresolved tension.

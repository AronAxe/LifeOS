# Debate Workflow

Full structured Council deliberation with three rounds and a visible transcript.

## Prerequisites

- exact topic or decision;
- relevant background and evidence;
- optional principal-specified members;
- any confidentiality or egress limits.

## 0. Compose the council

Write four topic-specific member briefs following `CouncilMembers.md`. Announce the roster and the decision being examined.

```markdown
## Council Debate: [Topic]

**Decision:** [what must be decided]
**Council:** [name — one-line role] …
**Rounds:** Positions → Challenges → Final judgments
```

## 1. Round 1 — Initial positions

Call `delegate_task` with one independent task per member, batched within the active concurrency limit. Every task receives the member brief, full topic context, evidence supplied by the principal, and these instructions:

```text
ROUND 1 — INITIAL POSITION
State your position from your assigned perspective.
- Give the key claim, evidence or reasoning, and decision criterion.
- Name the most important risk or uncertainty.
- State what evidence could change your view.
- Be specific; do not imitate consensus.
```

Render all successful responses under attributed headings. Mark failed or missing members; do not invent their contribution.

## 2. Round 2 — Responses and challenges

After Round 1 is complete, create a fresh `delegate_task` task for every member. Include:

- the original brief;
- topic and decision;
- complete Round 1 transcript;
- instruction to cite at least one named member's actual point.

```text
ROUND 2 — RESPOND AND CHALLENGE
Address the strongest opposing or complementary argument.
- Quote or identify the exact point being answered.
- Challenge assumptions, evidence, feasibility, or framing.
- Concede valid points and update where warranted.
- Preserve your distinct decision criterion.
```

Render the attributed Round 2 transcript.

## 3. Round 3 — Final judgments

Run another bounded `delegate_task` batch. Each task receives the brief plus Rounds 1 and 2.

```text
ROUND 3 — FINAL JUDGMENT
Given the full debate:
- state your final recommendation;
- identify what changed, if anything;
- name remaining disagreement and the decisive trade-off;
- propose the smallest next evidence or reversible action.
Do not force consensus.
```

Render the attributed Round 3 transcript.

## 4. Parent synthesis

The parent—not another unverified child—produces:

```markdown
### Council Synthesis

**Convergence**
- …

**Remaining disagreements**
- [who disagrees, on what, and why]

**Decision criteria and assumptions**
- …

**Recommended path**
- …

**Risks and reversibility**
- …

**Next evidence or action**
- …
```

Do not count votes as truth. Weight arguments by evidence, relevance, and the principal's stated criteria.

## Failure handling

- Continue with partial results when at least two distinct perspectives returned; disclose missing members.
- Retry only when a failure is transient and a retry does not exceed approved cost.
- If all members converge immediately, test whether briefs were genuinely distinct before declaring consensus.
- If the topic lacks enough context, stop before delegation and request the decisive missing input.

## Completion

The debate passes when the visible transcript includes actual cross-response, all failures are disclosed, and the synthesis preserves both convergence and unresolved tension.

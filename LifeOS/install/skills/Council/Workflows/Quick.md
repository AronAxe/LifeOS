# Quick Workflow

Use for a fast one-round perspective check when a full three-round Council would be disproportionate.

## 1. Frame and compose

Record the topic, immediate decision, decisive context, and confidentiality boundary. Write three or four distinct member briefs following `../CouncilMembers.md`.

```markdown
## Quick Council: [Topic]

**Decision:** [what is being checked]
**Members:** [name — role] …
**Mode:** one independent round
```

## 2. Gather perspectives

Call Hermes `delegate_task` with independent tasks in its `tasks` array, respecting the current concurrency limit. Each receives its member brief, the topic context, and:

```text
QUICK COUNCIL CHECK
Return:
1. your direct recommendation;
2. the strongest reason;
3. the most important risk or missing evidence;
4. one condition that would reverse your view.
Be concise and specific.
```

Do not give same-round members one another's answers. Mark failed tasks rather than filling the gap.

## 3. Summarize

```markdown
### Perspectives

**[Member — role]:** [response]

### Quick synthesis

**Convergence:** …
**Material disagreement:** …
**Recommendation:** proceed | reconsider | gather evidence | run full debate
**Decisive next check:** …
```

Escalate to `Debate.md` when members identify materially different decision criteria, unresolved high-impact risk, or a need for actual rebuttal.

## Completion

The quick check passes when each available perspective is attributed, disagreement is not hidden, and the recommendation is tied to an explicit decision criterion.

# Council Members

Council members are custom briefs executed through Hermes `delegate_task`. The brief—not a provider label—creates the persona and analytical friction.

## 1. Analyze the topic

Choose perspectives that expose the actual decision boundary.

For “Should we use WebSockets or SSE?” a useful roster might be:

- real-time systems architect defending bidirectional transport;
- frontend-DX advocate minimizing client complexity;
- operations skeptic focused on long-lived connections and observability;
- evidence analyst comparing production precedent and workload shape.

For “Is AI overhyped?” a useful roster might be:

- infrastructure builder with deployment evidence;
- security practitioner focused on failure modes;
- pragmatic engineer measuring total cost and substitution;
- researcher demanding reliable adoption and outcome data.

## 2. Write each brief

Use two to four sentences:

> **Mara — real-time systems architect.** Defends push-first bidirectional transport. She will challenge SSE's connection and reconnection behavior, but must concede cases where operational simplicity dominates. She cites protocol behavior rather than taste.

Each brief must contain a genuine criterion that could change the member's conclusion. A caricature that cannot update is theatre, not deliberation.

## 3. Build Hermes tasks

For each member, create a `delegate_task` task:

```text
{
  "goal": "Answer the assigned Council round as Mara, returning only the attributed contribution.",
  "context": "MEMBER BRIEF: …\nTOPIC: …\nROUND INSTRUCTIONS: …\nPRIOR TRANSCRIPT: …",
  "role": "leaf"
}
```

Submit independent members in the `tasks` array. Do not pin a provider model or use undeployed agent types. If the current batch cap is below the member count, use bounded batches and keep same-round prompts independent.

## Default perspective slots

| Slot | Purpose |
|---|---|
| Builder | What works in practice and what it takes to ship |
| Skeptic | Hidden assumptions, failure modes, and downside |
| Pragmatist | Cost, sequencing, reversibility, and operational trade-offs |
| Analyst | External evidence, precedent, and uncertainty |

These are starting points, not mandatory characters. A design problem may need a user advocate; a policy question may need legal, ethical, and affected-party perspectives.

## Quality checks

- Briefs are materially different.
- Each member has enough topic context to reason independently.
- No child needs to ask the principal a question.
- No secrets or irrelevant personal context enter the delegated prompt.
- Every member has a falsifiable claim, trade-off, or decision criterion to contribute.

# Mine Reflections Workflow

Mine recurring, evidenced improvement signals from memory and session systems that are actually configured. No automatic reflection ledger is installed by HALOS.

## 1. Scope and sources

Define the subsystem and time range. Use, in order of relevance:

- Hindsight recall/reflect for durable decisions, corrections, and learnings;
- LCM or session history for recent task evidence and unresolved patterns;
- evaluation, incident, test, issue, or ISA artifacts explicitly available in the project;
- a user-supplied reflection corpus.

Record sources searched and retrieval limits. An empty result from one backend is not proof that no evidence exists.

## 2. Extract signals

For every candidate instance capture an evidence handle/path, date, task context, observed behavior, consequence, user correction or test result, and affected component. Separate:

- execution-pattern failures;
- missing capability;
- documentation/trigger ambiguity;
- environment/tooling failure;
- aspirational suggestion without observed failure.

## 3. Cluster and challenge

Cluster only substantively similar instances. Preserve counterexamples. Distinguish one-off incidents from recurring patterns and rule absence from rule noncompliance. Check whether the proposed correction is already implemented, discussed, deferred, or rejected.

## 4. Rank candidates

For each theme report:

```text
Theme: <name>
Instances: <count with evidence handles>
Frequency/severity: <...>
Affected behavior: <...>
Likely root cause: <...>
Counterexamples/uncertainty: <...>
Prior status: done | partial | deferred | rejected | new
Smallest correction: <...>
Verification: <decisive test>
Recommendation: propose | monitor | no action
```

Weight high-severity repeated failures above frequent cosmetic issues. Keep frequency and confidence separate.

## 5. Deliver

Return sources searched, evidence coverage, prioritized themes, one-off warnings, aspirational ideas, rejected candidates, and uncertainty. Recommendations remain proposals in the current workspace; do not mutate doctrine, create jobs, or retain candidate state before acceptance.

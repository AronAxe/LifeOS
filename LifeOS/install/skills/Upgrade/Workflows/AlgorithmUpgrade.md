# Algorithm Upgrade Workflow

Use for a proposed change to the installed Algorithm skill or its governing doctrine. Doctrine changes require stronger evidence than ordinary implementation fixes.

## 1. Baseline the actual algorithm

Load the current Algorithm skill and every repository file declared authoritative. Summarize the phases, effort tiers, quality gates, verification rules, delegation boundaries, ISA use, and explicit non-goals. Record version/commit evidence; do not infer a spec that is not present.

## 2. Gather learning signals

Use evidence that actually exists:

- Hindsight decisions/corrections and synthesized reflection;
- current and prior session/LCM evidence;
- failed tests, incidents, rework, and user corrections;
- ISA outcomes and plugin evidence when enabled;
- repository issues, plans, diffs, and history;
- optional evaluation artifacts supplied by the user;
- current external doctrine/tool changes when relevant.

Do not assume an automatic reflection JSONL, rating ledger, failure directory, voice service, or proprietary evaluator.

## 3. Build a section heat map

For each phase/gate record:

```text
Section: <phase/gate>
Signals: <count and evidence handles>
Severity: low | medium | high
Observed gap: absence | noncompliance | implementation defect | unclear rule
Current coverage: <exact current text/behavior>
Counterevidence: <successful cases>
Upgrade pressure: none | monitor | propose
```

This prevents rewriting doctrine for a failure already covered by an ignored rule.

## 4. Form bounded proposals

Each proposal must include exact section, current behavior, minimal textual/executable delta, expected benefit, compatibility risk, alternatives, rollback, and decisive test. State why a code, test, tooling, or compliance fix is insufficient when the proposal changes doctrine.

Assess version impact using the repository's convention:

- patch: clarification or non-breaking correction;
- minor: new backward-compatible phase/gate/capability;
- major: incompatible contract or execution change.

Do not bump versions mechanically when no convention exists.

## 5. Output

```text
Algorithm self-upgrade report
Baseline: <version/commit>
Evidence coverage: <sources/time range>
Section heat map: <...>
Proposals: P1...Pn with risk/test/version impact
Already covered signals: <...>
Implementation defects (not doctrine): <...>
Aspirational ideas lacking evidence: <...>
Recommendation: approve/reject/monitor each proposal
```

## 6. Approval, implementation, learning

Do not self-modify automatically. After explicit approval, use repository/skill governance, preserve capability, run focused and full gates, and verify the resulting skill is loadable. Retain only the accepted durable decision and verified lesson; keep rejected drafts in task evidence rather than Hindsight.

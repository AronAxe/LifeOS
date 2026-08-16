# Research Upgrade Workflow

Use when a proposed upgrade requires current external technical evidence.

## 1. Frame the target

Identify the feature/subsystem, installed baseline, decision to support, version/date boundary, and compatibility constraints. Translate it into precise questions:

- What capability actually ships now?
- What is preview, deprecated, or speculative?
- What evidence supports the claimed benefit?
- What are migration, security, operational, and cost consequences?
- What would falsify the recommendation?

## 2. Research independent tracks

When warranted, run bounded independent tracks for official docs/releases, implementation/repository evidence, independent evaluations/incidents, and local compatibility. Use current primary sources and open every citation. Do not prescribe provider-specific agent types or hidden helper scripts.

## 3. Compare with local reality

Inspect installed code/config/runtime and prior decisions. Classify the candidate as done, partial, deferred, rejected, or new/unverified. A newer upstream version is not automatically an improvement for this installation.

## 4. Synthesize

Produce:

```text
Upgrade research: <candidate>
Executive conclusion: <bounded answer>
Prior status: <classification + evidence>
Current external capability: <version/date/status>
Technical mechanism: <how it works>
Evidence of benefit: <sources and conditions>
Limitations/failure modes: <...>
Local compatibility: <affected components/dependencies>
Security/privacy/cost: <...>
Smallest implementation: <steps/files>
Rollback: <...>
Decisive verification: <test>
Confidence and unknowns: <...>
Sources: <canonical URLs>
```

For release-note investigations, separate each relevant change, migration requirement, breaking change, and local applicability.

## 5. Decision boundary

Present the research and recommendation, then stop for approval. Do not install, configure, schedule, publish, or retain the proposal as a durable decision. If approved, execution proceeds through the Algorithm and repository governance with the defined rollback and verification.

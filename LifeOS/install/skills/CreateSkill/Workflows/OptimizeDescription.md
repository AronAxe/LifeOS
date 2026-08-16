# Optimize Description Workflow

A skill description is routing metadata. Optimize it against an explicit trigger set rather than by taste.

## 1. Establish the routing boundary

Read the complete skill and nearby skill descriptions. State:

- the primary user intent;
- important synonyms and shorthand;
- required exclusions or negative triggers;
- adjacent skills that should win near-boundary requests;
- the bounded outcome this skill provides.

The opening must remain self-contained because skill indexes may truncate long descriptions.

## 2. Build an evaluation set

Create at least ten **should-trigger** and ten **should-not-trigger** prompts when the skill is broad enough to warrant formal optimization. Include:

- direct requests;
- natural shorthand and misspellings;
- implicit but valid requests;
- near-neighbor intents;
- requests containing shared keywords that belong elsewhere;
- adversarially vague cases.

Record the expected route and one-sentence reason for every prompt. Review ambiguous expectations before testing; a mislabeled evaluation set merely optimizes the wrong boundary with great efficiency.

## 3. Evaluate the current description

Inspect the description as it appears through `skills_list`, not only in the source file. For each prompt classify the expected routing decision as true positive, false positive, true negative, or false negative. When a fresh isolated session or approved evaluator is available, run the same prompts there; otherwise label the result as static review rather than runtime proof.

Report precision, recall, and the specific ambiguity behind each failure. Do not present heuristic routing tests as deterministic guarantees.

## 4. Draft the smallest improvement

- Lead with `Use when ...`.
- Name the user intent and bounded behavior.
- Include high-value synonyms, not a keyword landfill.
- Add a concise exclusion when a nearby skill would otherwise collide.
- Omit implementation details likely to change.
- Do not add private names, paths, unsupported mechanisms, or marketing claims.

## 5. Re-test and compare

Run the unchanged evaluation set against the candidate description. Return:

```text
Description optimization
- baseline: TP __ / FP __ / TN __ / FN __
- candidate: TP __ / FP __ / TN __ / FN __
- improved cases: ...
- regressions: ...
- unresolved ambiguities: ...
```

Apply only when the candidate improves the intended boundary without material regression. Patch the description alone, re-view the skill, and note whether a reload is required.

# ViewResults Workflow

Inspect completed evaluation runs without mutating them.

## Result location

Resolve `LIFEOS_EVALS_WORKSPACE`, or `<PROJECT_DIR>/.lifeos-evals` when unset. Per-run evidence lives at:

```text
<EVAL_WORKSPACE>/results/<use-case>/<run-id>/results.json
<EVAL_WORKSPACE>/results/<use-case>/<run-id>/transcripts/trial_N.json
```

The installed skill directory is read-only and is not a result store.

## Execution

1. Use Hermes file discovery to list `<EVAL_WORKSPACE>/results/<use-case>/` by modification time. Do not infer the latest run from a name alone.
2. Read the selected `results.json` and validate that its `task_id` matches the requested use case.
3. Inspect:
   - run ID and timestamps;
   - trial count and trial status;
   - pass rate, mean score, standard deviation, pass@k, and pass^k;
   - grader scores, reasoning, and errors;
   - failed-trial transcripts and unmet criteria.
4. When a suite may be graduating from capability to regression, run:

   ```bash
   bun run <EVALS_SKILL_DIR>/Tools/SuiteManager.ts check-saturation <suite-name>
   ```

5. For comparisons, select explicit run IDs and compare like-for-like task, prompt, grader, model, and trial settings. State any mismatch rather than presenting it as a trend.

## Report

Report:

| Field | Value |
|---|---|
| Use case | `<use-case>` |
| Run ID | `<run-id>` |
| Completed | `<timestamp>` |
| Trials | `<n>` |
| Pass rate | `<percent>` |
| Mean score | `<score>` |
| pass@k / pass^k | `<value> / <value>` |
| Result path | `<exact path>` |

Then summarize the strongest failure evidence, unmet criteria, infrastructure errors, and the narrowest next action. If the run artifact is incomplete or malformed, say so; do not synthesize missing results.

## Trend boundary

The current skill has no dedicated cross-run trend CLI. A one-off comparison may use a bounded project-local script over selected `results.json` files. Recurring analysis requires an implemented and tested tool before it is advertised as built-in capability.

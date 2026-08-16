# RunScenario

Run a multi-turn scenario through Hermes-configured inference. The simulator, agent under test, and judge are provider-agnostic; no external model SDK is bundled or required.

## When to use

- Test whether an assistant handles a realistic interaction end to end.
- Regression-test behavior across multiple turns.
- Evaluate prompts against explicit conversational criteria.

For single-shot grading, use `RunEval` instead.

## Prerequisites and consent

- A scenario module exporting `HermesScenarioConfig`; use `CreateScenario` if one does not exist.
- Explicit approval for the inference calls and their cost/egress boundary.
- Set `LIFEOS_INFERENCE_APPROVED=1` only for the approved run. Hermes uses its configured provider and model unless the scenario explicitly overrides them.
- Optionally set `LIFEOS_EVALS_WORKSPACE`; otherwise results remain in `<PROJECT_DIR>/.lifeos-evals`.

Credential presence is not approval. Never print or migrate provider credentials.

## Steps

1. Confirm the scenario path, criteria, trial count, model overrides, and cost boundary.
2. Start with one trial:

   ```bash
   cd <EVALS_SKILL_DIR>
   LIFEOS_INFERENCE_APPROVED=1 bun run Tools/ScenarioRunner.ts \
     --scenario Scenarios/<name>.scenario.ts
   ```

3. Inspect:
   - `<EVAL_WORKSPACE>/results/<scenario-id>/<run-id>/results.json`
   - `<EVAL_WORKSPACE>/results/<scenario-id>/<run-id>/transcripts/trial_N.json`
4. After judge calibration, run three or more trials for pass@k and pass^k:

   ```bash
   LIFEOS_INFERENCE_APPROVED=1 bun run Tools/ScenarioRunner.ts \
     --scenario Scenarios/<name>.scenario.ts --trials 3
   ```

5. Report pass rate, mean score, pass@k, pass^k, unmet criteria, and the result path.

## Exit codes

- `0` — at least one trial passed.
- `1` — every trial failed.
- `2` — invalid CLI arguments.
- `3` — inference spending was not explicitly approved.
- `4` — scenario file not found.
- `5` — invalid scenario module.
- `10` — fatal runner error.

## Options

| Flag | Default | Purpose |
|------|---------|---------|
| `--scenario <path>` | required | Scenario module |
| `--trials <n>` | `1` | Trials for pass@k statistics |
| `--timeout-ms <ms>` | `180000` | Per-trial timeout |
| `--suite <name>` | none | Associate the run with a suite |
| `--json` | false | Also emit the complete `EvalRun` to stdout |

The runner records inference failures as failed trials with explicit errors; it does not silently substitute synthetic model output.

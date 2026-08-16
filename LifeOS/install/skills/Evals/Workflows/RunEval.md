# RunEval Workflow

Run an evaluation suite from the configured workspace through the Evals tools.

## Prerequisites

- Resolve the installed skill directory as `<EVALS_SKILL_DIR>`.
- Resolve mutable state as `LIFEOS_EVALS_WORKSPACE`, or `<PROJECT_DIR>/.lifeos-evals` when unset.
- Confirm the use case exists beneath `<EVAL_WORKSPACE>/use-cases/<name>/` and contains valid test cases and grader configuration.
- Obtain explicit approval before any model-based grader call. Code-based graders do not require model spending.

## Execution

1. Inspect the use-case configuration with Hermes file tools. If it is absent or invalid, route to `CreateUseCase`.
2. Run the suite through the canonical bridge:

   ```bash
   bun run <EVALS_SKILL_DIR>/Tools/AlgorithmBridge.ts -s <use-case>
   ```

3. For an explicitly approved Algorithm ISC update:

   ```bash
   bun run <EVALS_SKILL_DIR>/Tools/AlgorithmBridge.ts -s <use-case> -r <isc-row> -u
   ```

   Do not use `-u` without confirming the target artifact and write scope.

4. To include suite saturation status:

   ```bash
   bun run <EVALS_SKILL_DIR>/Tools/AlgorithmBridge.ts -s <use-case> --show-saturation
   ```

5. Read the generated result from:
   - `<EVAL_WORKSPACE>/results/<use-case>/<run-id>/results.json`
   - `<EVAL_WORKSPACE>/results/<use-case>/<run-id>/transcripts/` when transcripts were captured.

## Report

Report the run ID, trial count, pass rate, mean score, failed tests, grader errors, model/provider used for approved model-based graders, and the exact result path. Distinguish a failed evaluation from an infrastructure or inference error.

## Failure handling

- Missing use case: route to `CreateUseCase`.
- Invalid configuration: identify the exact file and field; do not guess defaults silently.
- Unapproved model spending: stop before inference and request approval.
- Provider/runtime failure: preserve the error in the run artifact and report that no valid judge result was obtained.
- Failed tests: retain the transcripts and grader evidence needed to reproduce the failure.

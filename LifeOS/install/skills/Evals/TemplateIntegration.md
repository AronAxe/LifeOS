# Template Integration

## Runtime contract

This Hermes port does not install the upstream global `Templates/` tree or its `RenderTemplate.ts` executable. Evaluation artifacts are project data, not skill content.

Resolve these locations before using the workflows:

- `<EVALS_SKILL_DIR>` — the installed Evals skill directory selected by Hermes.
- `<EVAL_WORKSPACE>` — `LIFEOS_EVALS_WORKSPACE` when configured, otherwise `<PROJECT_DIR>/.lifeos-evals`.

The workspace layout is:

```text
<EVAL_WORKSPACE>/
├── use-cases/
├── suites/
├── results/
└── failures.jsonl
```

## Creating custom judges

Create `<EVAL_WORKSPACE>/use-cases/<name>/judge-config.yaml` using the schema in `Workflows/CreateJudge.md`. Then write the judge prompt directly to `judge-prompt.md`, preserving the declared criteria, weights, scale, reasoning requirement, and output format. Review the rendered prompt before wiring it into the use-case config.

## Creating rubrics

Create rubric source and rendered Markdown under the relevant use-case directory. The rubric must state:

1. the dimensions being scored;
2. observable indicators for each score;
3. criterion weights that sum to `1.0`;
4. the required output schema; and
5. whether position swapping is required.

No implicit global template renderer is available. If a project chooses to add one, treat it as an explicit project dependency and record the command in that project's evaluation README.

## LLM-as-judge best practices

1. Require reasoning before scoring.
2. Prefer a calibrated 1–5 scale over 0–100.
3. Use a different judge model where practical.
4. Use position swapping for pairwise comparison.
5. Calibrate model judges against human ratings.

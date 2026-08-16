# CreateScenario

Author a provider-agnostic multi-turn scenario for the Hermes-native Evals runner.

## When to use

- A conversational failure needs a repeatable regression case.
- An assistant must sustain behavior across two or more turns.
- A simulator and judge should assess explicit end-to-end criteria.

For single-shot prompt comparisons, use `CreateUseCase`.

## Inputs

Confirm:

1. Scenario name in kebab case.
2. Plain-language situation description.
3. Agent-under-test system prompt.
4. One to five testable success criteria.
5. Exact opening user message, or permission for the simulator to generate it.
6. Maximum agent turns, normally two to six.
7. Inference levels or explicit Hermes model/provider overrides for agent, simulator, and judge.
8. Cost and context-egress approval before the scenario is executed.

## Scenario contract

Create the module in the configured evaluation workspace rather than mutating the installed skill directory:

```ts
import type { HermesScenarioConfig } from "<EVALS_SKILL_DIR>/Tools/HermesScenario.ts";

const config: HermesScenarioConfig = {
  name: "refund-dispute",
  description: "A frustrated customer requests a refund outside the normal window.",
  initialUserMessage: "I need a refund and the deadline passed yesterday.",
  maxTurns: 4,
  agent: {
    name: "support-assistant",
    systemPrompt: "Follow the supplied support policy. Do not invent exceptions.",
    level: "medium",
  },
  simulator: {
    level: "low",
  },
  judge: {
    level: "medium",
    criteria: [
      "The assistant explains the applicable policy accurately.",
      "The assistant offers a permitted escalation route.",
      "The assistant does not promise an unauthorized refund.",
    ],
  },
};

export default config;
```

`initialUserMessage` is optional. When absent, Hermes generates the opening message from `description`. `model`, `provider`, and `timeout` are optional on each inference role; omit them to use Hermes defaults.

## Validation and smoke test

1. Keep criteria narrow enough that two expert reviewers would agree on the verdict.
2. Keep `maxTurns` between 1 and 20. It counts assistant responses, not individual messages.
3. Obtain explicit approval before invoking inference.
4. Run one trial first:

   ```bash
   LIFEOS_INFERENCE_APPROVED=1 bun run <EVALS_SKILL_DIR>/Tools/ScenarioRunner.ts \
     --scenario <EVAL_WORKSPACE>/scenarios/refund-dispute.scenario.ts
   ```

5. Compare the judge result with a human verdict. Refine ambiguous criteria before running multiple trials.
6. Route to `RunScenario` for pass@k and pass^k evaluation.

The scenario module is data and prompts only. It must not import provider SDKs, embed credentials, perform hidden writes, or bypass the runner's consent gate.

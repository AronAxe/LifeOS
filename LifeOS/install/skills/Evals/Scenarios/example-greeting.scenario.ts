#!/usr/bin/env bun
/** Minimal provider-agnostic scenario for the Hermes-native Evals runner. */

import type { HermesScenarioConfig } from "../Tools/HermesScenario.ts";

const config: HermesScenarioConfig = {
  name: "example-greeting",
  description: "A user greets a general-purpose assistant and expects a concise, polite reply in English.",
  initialUserMessage: "Hello. Could you greet me briefly?",
  maxTurns: 1,
  agent: {
    name: "hermes-assistant",
    systemPrompt: "You are a concise, polite assistant. Keep replies under 40 words.",
    level: "low",
  },
  judge: {
    level: "low",
    criteria: [
      "The assistant responds politely.",
      "The response is in English.",
      "The response is concise and does not exceed 40 words.",
    ],
  },
};

export default config;

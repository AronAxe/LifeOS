#!/usr/bin/env bun
/** Hermes-native multi-turn scenario execution with no provider SDK dependency. */

import { inference, type InferenceLevel } from "./HermesInference.ts";

export interface ScenarioModelConfig {
  level?: InferenceLevel;
  model?: string;
  provider?: string;
  timeout?: number;
}

export interface HermesScenarioConfig {
  name: string;
  description: string;
  agent: ScenarioModelConfig & {
    name?: string;
    systemPrompt: string;
  };
  simulator?: ScenarioModelConfig & {
    systemPrompt?: string;
  };
  judge: ScenarioModelConfig & {
    criteria: string[];
    systemPrompt?: string;
  };
  initialUserMessage?: string;
  maxTurns?: number;
}

export interface ScenarioMessage {
  role: "user" | "assistant";
  content: string;
}

export interface HermesScenarioResult {
  runId: string;
  success: boolean;
  messages: ScenarioMessage[];
  reasoning: string;
  metCriteria: string[];
  unmetCriteria: string[];
  totalTime: number;
  error?: string;
}

export function validateScenarioConfig(value: unknown): asserts value is HermesScenarioConfig {
  if (!value || typeof value !== "object") throw new Error("scenario config must be an object");
  const config = value as Partial<HermesScenarioConfig>;
  if (typeof config.name !== "string" || !config.name.trim()) throw new Error("scenario.name is required");
  if (typeof config.description !== "string" || !config.description.trim()) throw new Error("scenario.description is required");
  if (!config.agent || typeof config.agent.systemPrompt !== "string" || !config.agent.systemPrompt.trim()) {
    throw new Error("scenario.agent.systemPrompt is required");
  }
  if (!config.judge || !Array.isArray(config.judge.criteria) || config.judge.criteria.length === 0) {
    throw new Error("scenario.judge.criteria must contain at least one criterion");
  }
  if (config.judge.criteria.some((criterion) => typeof criterion !== "string" || !criterion.trim())) {
    throw new Error("every scenario judge criterion must be a non-empty string");
  }
  const maxTurns = config.maxTurns ?? 4;
  if (!Number.isInteger(maxTurns) || maxTurns < 1 || maxTurns > 20) {
    throw new Error("scenario.maxTurns must be an integer from 1 to 20");
  }
}

function transcript(messages: ScenarioMessage[]): string {
  return messages.map((message) => `[${message.role}]: ${message.content}`).join("\n\n");
}

async function runModel(
  config: ScenarioModelConfig,
  systemPrompt: string,
  userPrompt: string,
  expectJson = false,
): Promise<{ output: string; parsed?: unknown }> {
  const result = await inference({
    systemPrompt,
    userPrompt,
    expectJson,
    level: config.level ?? "medium",
    model: config.model,
    provider: config.provider,
    timeout: config.timeout ?? 60_000,
  });
  if (!result.success) throw new Error(result.error ?? "Hermes inference failed");
  return { output: result.output.trim(), parsed: result.parsed };
}

interface JudgePayload {
  reasoning?: unknown;
  results?: unknown;
}

export async function runHermesScenario(config: HermesScenarioConfig, runId: string): Promise<HermesScenarioResult> {
  validateScenarioConfig(config);
  const started = Date.now();
  const messages: ScenarioMessage[] = [];
  const maxTurns = config.maxTurns ?? 4;

  try {
    if (config.initialUserMessage?.trim()) {
      messages.push({ role: "user", content: config.initialUserMessage.trim() });
    } else {
      const opening = await runModel(
        config.simulator ?? {},
        config.simulator?.systemPrompt ?? "You simulate a realistic user. Return only the user's opening message.",
        `Scenario description:\n${config.description}\n\nGenerate the opening user message.`,
      );
      messages.push({ role: "user", content: opening.output });
    }

    for (let turn = 0; turn < maxTurns; turn++) {
      const agent = await runModel(
        config.agent,
        config.agent.systemPrompt,
        `Conversation so far:\n${transcript(messages)}\n\nReturn only the assistant's next response.`,
      );
      messages.push({ role: "assistant", content: agent.output });

      if (turn === maxTurns - 1) break;
      const simulatedUser = await runModel(
        config.simulator ?? {},
        config.simulator?.systemPrompt ??
          "You simulate the user in a multi-turn evaluation. Return [[DONE]] if the interaction is naturally complete; otherwise return only the user's next message.",
        `Scenario description:\n${config.description}\n\nConversation so far:\n${transcript(messages)}`,
      );
      if (simulatedUser.output.trim() === "[[DONE]]") break;
      messages.push({ role: "user", content: simulatedUser.output });
    }

    const judgePrompt = [
      `Scenario description:\n${config.description}`,
      `Conversation:\n${transcript(messages)}`,
      "JUDGE CRITERIA:",
      ...config.judge.criteria.map((criterion, index) => `${index + 1}. ${criterion}`),
      "",
      "Return JSON only with this shape:",
      '{"reasoning":"brief overall judgment","results":[{"criterion":1,"met":true,"reason":"brief evidence"}]}',
      `Return exactly ${config.judge.criteria.length} results in criterion order.`,
    ].join("\n");
    const judged = await runModel(
      config.judge,
      config.judge.systemPrompt ?? "You are a strict evaluation judge. Assess only the supplied conversation and criteria.",
      judgePrompt,
      true,
    );
    const payload = judged.parsed as JudgePayload;
    if (!payload || !Array.isArray(payload.results) || payload.results.length !== config.judge.criteria.length) {
      throw new Error("scenario judge returned an invalid results array");
    }

    const decisions = payload.results.map((item, index) => {
      if (!item || typeof item !== "object" || typeof (item as { met?: unknown }).met !== "boolean") {
        throw new Error(`scenario judge result ${index + 1} is missing boolean met`);
      }
      return (item as { met: boolean }).met;
    });
    const metCriteria = config.judge.criteria.filter((_, index) => decisions[index]);
    const unmetCriteria = config.judge.criteria.filter((_, index) => !decisions[index]);

    return {
      runId,
      success: unmetCriteria.length === 0,
      messages,
      reasoning: typeof payload.reasoning === "string" ? payload.reasoning : "",
      metCriteria,
      unmetCriteria,
      totalTime: (Date.now() - started) / 1000,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      runId,
      success: false,
      messages,
      reasoning: `Scenario failed: ${message}`,
      metCriteria: [],
      unmetCriteria: [...config.judge.criteria],
      totalTime: (Date.now() - started) / 1000,
      error: message,
    };
  }
}

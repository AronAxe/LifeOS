#!/usr/bin/env bun
/** Compatibility wrapper for invoking the agent-under-test through Hermes. */

import { inference, type InferenceLevel } from "./HermesInference.ts";
import type { ScenarioMessage } from "./HermesScenario.ts";

export interface HermesAgentAdapterOptions {
  systemPrompt?: string;
  level?: InferenceLevel;
  timeout?: number;
  model?: string;
  provider?: string;
  name?: string;
}

export class HermesAgentAdapter {
  readonly name: string;
  private readonly options: Required<Pick<HermesAgentAdapterOptions, "systemPrompt" | "level" | "timeout">> &
    Pick<HermesAgentAdapterOptions, "model" | "provider">;

  constructor(options: HermesAgentAdapterOptions = {}) {
    this.name = options.name ?? "hermes-agent";
    this.options = {
      systemPrompt: options.systemPrompt ?? "You are a helpful assistant.",
      level: options.level ?? "medium",
      timeout: options.timeout ?? 60_000,
      model: options.model,
      provider: options.provider,
    };
  }

  async call(messages: ScenarioMessage[]): Promise<string> {
    const result = await inference({
      systemPrompt: this.options.systemPrompt,
      userPrompt: messages.map((message) => `[${message.role}]: ${message.content}`).join("\n\n"),
      level: this.options.level,
      timeout: this.options.timeout,
      model: this.options.model,
      provider: this.options.provider,
    });
    if (!result.success) throw new Error(`HermesAgentAdapter inference failed: ${result.error ?? "unknown error"}`);
    return result.output.trim();
  }
}

/** @deprecated Use HermesAgentAdapter. Kept as a source-compatible export for existing scenarios. */
export class LifeosAgentAdapter extends HermesAgentAdapter {}

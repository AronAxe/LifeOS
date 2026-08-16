#!/usr/bin/env bun
/** Provider-agnostic, consent-gated inference through the installed Hermes CLI. */

export type InferenceLevel = "low" | "medium" | "high" | "max";

export interface InferenceOptions {
  systemPrompt: string;
  userPrompt: string;
  level?: InferenceLevel;
  expectJson?: boolean;
  timeout?: number;
  model?: string;
  provider?: string;
}

export interface InferenceResult {
  success: boolean;
  output: string;
  parsed?: unknown;
  error?: string;
  latencyMs: number;
  level: InferenceLevel;
}

const VALID_LEVELS: readonly InferenceLevel[] = ["low", "medium", "high", "max"];

function normalizeLevel(level: string | undefined): InferenceLevel {
  if (!level) return "medium";
  if (VALID_LEVELS.includes(level as InferenceLevel)) return level as InferenceLevel;
  throw new Error(`Unknown Hermes reasoning level '${level}' — use low | medium | high | max`);
}

function commandPrefix(): string[] {
  const configured = process.env.HERMES_INFERENCE_COMMAND_JSON;
  if (configured) {
    const parsed = JSON.parse(configured);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.some((item) => typeof item !== "string" || !item)) {
      throw new Error("HERMES_INFERENCE_COMMAND_JSON must be a non-empty JSON string array");
    }
    return parsed;
  }
  return [Bun.which("hermes") ?? "hermes"];
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    const arrayStart = trimmed.indexOf("[");
    const arrayEnd = trimmed.lastIndexOf("]");
    if (arrayStart >= 0 && arrayEnd > arrayStart) return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1));
    const objectStart = trimmed.indexOf("{");
    const objectEnd = trimmed.lastIndexOf("}");
    if (objectStart >= 0 && objectEnd > objectStart) return JSON.parse(trimmed.slice(objectStart, objectEnd + 1));
    throw new Error("Hermes response did not contain valid JSON");
  }
}

export async function inference(options: InferenceOptions): Promise<InferenceResult> {
  const level = normalizeLevel(options.level);
  const started = Date.now();

  if (process.env.LIFEOS_INFERENCE_APPROVED !== "1") {
    return {
      success: false,
      output: "",
      error: "Inference spending is not approved. Set LIFEOS_INFERENCE_APPROVED=1 for this explicitly approved run.",
      latencyMs: Date.now() - started,
      level,
    };
  }

  const prompt = [
    "Perform one bounded inference task. Do not call tools. Return only the requested answer.",
    "",
    "SYSTEM INSTRUCTION:",
    options.systemPrompt,
    "",
    "USER REQUEST:",
    options.userPrompt,
  ].join("\n");

  const args = [
    ...commandPrefix(),
    "chat",
    "--query",
    prompt,
    "--quiet",
    "--ignore-rules",
    "--source",
    "tool",
    "--max-turns",
    "1",
    "--reasoning",
    level,
  ];
  if (options.model) args.push("--model", options.model);
  if (options.provider) args.push("--provider", options.provider);

  const timeout = options.timeout ?? 60_000;
  let timedOut = false;

  try {
    const child = Bun.spawn({
      cmd: args,
      cwd: process.cwd(),
      env: process.env,
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdoutPromise = new Response(child.stdout).text();
    const stderrPromise = new Response(child.stderr).text();
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeout);
    const exitCode = await child.exited;
    clearTimeout(timer);
    const [stdout, stderr] = await Promise.all([stdoutPromise, stderrPromise]);
    const output = stdout.trim();

    if (timedOut) {
      return { success: false, output, error: `Hermes inference timed out after ${timeout}ms`, latencyMs: Date.now() - started, level };
    }
    if (exitCode !== 0) {
      return { success: false, output, error: stderr.trim() || `Hermes exited ${exitCode}`, latencyMs: Date.now() - started, level };
    }

    if (options.expectJson) {
      try {
        return { success: true, output, parsed: extractJson(output), latencyMs: Date.now() - started, level };
      } catch (error) {
        return { success: false, output, error: error instanceof Error ? error.message : String(error), latencyMs: Date.now() - started, level };
      }
    }

    return { success: true, output, latencyMs: Date.now() - started, level };
  } catch (error) {
    return { success: false, output: "", error: error instanceof Error ? error.message : String(error), latencyMs: Date.now() - started, level };
  }
}

#!/usr/bin/env bun
/** Run consent-gated, provider-agnostic multi-turn scenarios through Hermes. */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { runHermesScenario, validateScenarioConfig, type HermesScenarioConfig, type HermesScenarioResult } from "./HermesScenario.ts";
import { buildTrial } from "./ScenarioToTranscript.ts";
import type { EvalRun, Trial } from "../Types/index.ts";

interface Args {
  scenario: string;
  trials: number;
  json: boolean;
  suite?: string;
  timeoutMs: number;
}

const DEFAULT_TIMEOUT_MS = 180_000;

function printHelp(): void {
  process.stderr.write(`\nScenarioRunner — run a Hermes-native multi-turn agent scenario.\n\nRequired:\n  --scenario <path>    Path to a .scenario.ts module\n\nOptional:\n  --trials <n>         Number of trials for pass@k (default 1)\n  --timeout-ms <ms>    Per-trial timeout (default 180000 = 3 min)\n  --suite <name>       Evals suite to associate this run with\n  --json               Emit run JSON to stdout in addition to file\n  -h, --help           Show this help\n\nSafety:\n  LIFEOS_INFERENCE_APPROVED=1 is required. Hermes uses its configured provider/model unless the scenario explicitly overrides them.\n\n`);
}

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const out: Args = { scenario: "", trials: 1, json: false, timeoutMs: DEFAULT_TIMEOUT_MS };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--scenario" || arg === "-s") out.scenario = args[++i];
    else if (arg === "--trials" || arg === "-t") out.trials = Number.parseInt(args[++i], 10);
    else if (arg === "--suite") out.suite = args[++i];
    else if (arg === "--timeout-ms") out.timeoutMs = Number.parseInt(args[++i], 10);
    else if (arg === "--json") out.json = true;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  if (!out.scenario || !Number.isInteger(out.trials) || out.trials < 1 || !Number.isInteger(out.timeoutMs) || out.timeoutMs < 1) {
    printHelp();
    process.exit(2);
  }
  return out;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolvePromise, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolvePromise(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

async function loadScenarioModule(path: string): Promise<{ config: HermesScenarioConfig; id: string }> {
  const resolved = resolve(process.cwd(), path);
  if (!existsSync(resolved)) {
    process.stderr.write(`\nERROR: scenario file not found: ${resolved}\n\n`);
    process.exit(4);
  }
  const mod = await import(resolved);
  const candidate = mod.default ?? mod.scenario ?? mod.config;
  try {
    validateScenarioConfig(candidate);
  } catch (error) {
    process.stderr.write(`\nERROR: invalid scenario module ${path}: ${error instanceof Error ? error.message : String(error)}\n\n`);
    process.exit(5);
  }
  const id = basename(resolved).replace(/\.scenario\.ts$/, "").replace(/\.ts$/, "");
  return { config: candidate, id };
}

function computePassRates(trials: Trial[]): { passRate: number; meanScore: number; stdDev: number; passAtK: number; passToK: number } {
  const count = trials.length;
  if (count === 0) return { passRate: 0, meanScore: 0, stdDev: 0, passAtK: 0, passToK: 0 };
  const passed = trials.filter((trial) => trial.passed).length;
  const scores = trials.map((trial) => trial.score);
  const mean = scores.reduce((total, score) => total + score, 0) / count;
  const variance = scores.reduce((total, score) => total + (score - mean) ** 2, 0) / count;
  return {
    passRate: passed / count,
    meanScore: mean,
    stdDev: Math.sqrt(variance),
    passAtK: passed >= 1 ? 1 : 0,
    passToK: passed === count ? 1 : 0,
  };
}

async function main(): Promise<void> {
  const args = parseArgs();
  if (process.env.LIFEOS_INFERENCE_APPROVED !== "1") {
    process.stderr.write("\nERROR: inference spending is not approved. Set LIFEOS_INFERENCE_APPROVED=1 for this explicitly approved run.\n\n");
    process.exit(3);
  }

  const { config, id: scenarioId } = await loadScenarioModule(args.scenario);
  const runId = `${scenarioId}_${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const workspace = resolve(process.env.LIFEOS_EVALS_WORKSPACE ?? join(process.cwd(), ".lifeos-evals"));
  const runDir = join(workspace, "results", scenarioId, runId);
  mkdirSync(join(runDir, "transcripts"), { recursive: true });

  process.stderr.write(`\nScenarioRunner\n  scenario: ${scenarioId}\n  run: ${runId}\n  trials: ${args.trials}\n  output: ${runDir}\n\n`);

  const trials: Trial[] = [];
  const startedAt = new Date().toISOString();
  const startMs = Date.now();

  for (let i = 1; i <= args.trials; i++) {
    const trialStart = Date.now();
    let result: HermesScenarioResult;
    let error: string | undefined;
    try {
      result = await withTimeout(runHermesScenario(config, `${runId}_trial_${i}`), args.timeoutMs, `scenario ${scenarioId} trial ${i}`);
      error = result.error;
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
      result = {
        runId: `${runId}_trial_${i}`,
        success: false,
        messages: [],
        reasoning: `Scenario threw: ${error}`,
        metCriteria: [],
        unmetCriteria: [...config.judge.criteria],
        totalTime: (Date.now() - trialStart) / 1000,
        error,
      };
    }

    const trial = buildTrial({ taskId: scenarioId, trialNumber: i, result, error });
    trials.push(trial);
    writeFileSync(join(runDir, "transcripts", `trial_${i}.json`), JSON.stringify(trial, null, 2));
    process.stderr.write(`  trial ${i}/${args.trials}: ${trial.passed ? "PASS" : "FAIL"} score=${trial.score.toFixed(2)}\n`);
  }

  const rates = computePassRates(trials);
  const evalRun: EvalRun = {
    id: runId,
    task_id: scenarioId,
    trials,
    n_trials: trials.length,
    pass_rate: rates.passRate,
    mean_score: rates.meanScore,
    std_dev: rates.stdDev,
    pass_at_k: rates.passAtK,
    pass_to_k: rates.passToK,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    total_duration_ms: Date.now() - startMs,
    metadata: { source: "hermes_scenario", suite: args.suite, scenario_name: config.name },
  };

  const resultsPath = join(runDir, "results.json");
  writeFileSync(resultsPath, JSON.stringify(evalRun, null, 2));
  process.stderr.write(`\nSummary:\n  pass_rate: ${(rates.passRate * 100).toFixed(1)}%\n  mean_score: ${rates.meanScore.toFixed(2)}\n  pass@k: ${rates.passAtK}  pass^k: ${rates.passToK}\n  results.json: ${resultsPath}\n\n`);
  if (args.json) process.stdout.write(JSON.stringify(evalRun, null, 2) + "\n");
  process.exit(rates.passAtK ? 0 : 1);
}

main().catch((error) => {
  process.stderr.write(`\nFATAL: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n\n`);
  process.exit(10);
});

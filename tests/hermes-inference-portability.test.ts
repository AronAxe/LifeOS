import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inference as evalInference } from "../LifeOS/install/skills/Evals/Tools/HermesInference";
import { inference as audioInference } from "../LifeOS/install/skills/AudioEditor/Tools/HermesInference";

const originalApproval = process.env.LIFEOS_INFERENCE_APPROVED;
const originalCommand = process.env.HERMES_INFERENCE_COMMAND_JSON;
const originalCapture = process.env.HERMES_INFERENCE_CAPTURE;

afterEach(() => {
  if (originalApproval === undefined) delete process.env.LIFEOS_INFERENCE_APPROVED;
  else process.env.LIFEOS_INFERENCE_APPROVED = originalApproval;
  if (originalCommand === undefined) delete process.env.HERMES_INFERENCE_COMMAND_JSON;
  else process.env.HERMES_INFERENCE_COMMAND_JSON = originalCommand;
  if (originalCapture === undefined) delete process.env.HERMES_INFERENCE_CAPTURE;
  else process.env.HERMES_INFERENCE_CAPTURE = originalCapture;
});

describe("Hermes inference adapters", () => {
  test("fail closed before launching a paid inference run", async () => {
    delete process.env.LIFEOS_INFERENCE_APPROVED;
    process.env.HERMES_INFERENCE_COMMAND_JSON = JSON.stringify(["definitely-not-a-real-command"]);

    for (const run of [evalInference, audioInference]) {
      const result = await run({ systemPrompt: "system", userPrompt: "user" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("not approved");
    }
  });

  test("invoke an isolated Hermes turn and parse JSON through a stub CLI", async () => {
    const dir = mkdtempSync(join(tmpdir(), "halos-hermes-inference-"));
    try {
      const fake = join(dir, "fake-hermes.ts");
      const capture = join(dir, "args.json");
      writeFileSync(
        fake,
        [
          'import { writeFileSync } from "node:fs";',
          'writeFileSync(process.env.HERMES_INFERENCE_CAPTURE!, JSON.stringify(process.argv.slice(2)));',
          'console.log(JSON.stringify([{ decision: "ok" }]));',
        ].join("\n"),
      );
      process.env.LIFEOS_INFERENCE_APPROVED = "1";
      process.env.HERMES_INFERENCE_CAPTURE = capture;
      process.env.HERMES_INFERENCE_COMMAND_JSON = JSON.stringify([process.execPath, fake]);

      const result = await evalInference({
        systemPrompt: "Judge precisely.",
        userPrompt: "Return a JSON decision.",
        level: "high",
        expectJson: true,
        timeout: 5_000,
        model: "configured/example-model",
      });

      expect(result.success).toBe(true);
      expect(result.parsed).toEqual([{ decision: "ok" }]);
      const args = JSON.parse(readFileSync(capture, "utf8")) as string[];
      expect(args).toContain("chat");
      expect(args).toContain("--ignore-rules");
      expect(args).toContain("--source");
      expect(args).toContain("tool");
      expect(args).toContain("--max-turns");
      expect(args).toContain("1");
      expect(args).toContain("--reasoning");
      expect(args).toContain("high");
      expect(args).toContain("--model");
      expect(args).toContain("configured/example-model");
      expect(args.join("\n")).toContain("Judge precisely.");
      expect(args.join("\n")).toContain("Return a JSON decision.");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

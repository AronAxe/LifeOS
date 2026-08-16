#!/usr/bin/env bun
/**
 * Transcribe.ts — Word-level transcription via Whisper
 *
 * Uses insanely-fast-whisper with MPS on macOS when available.
 * Falls back to the cross-platform standard Whisper CLI.
 *
 * Usage: bun Transcribe.ts <audio-file> [--output <path>]
 * Output: JSON file with word-level timestamps at <audio-file>.transcript.json
 */

import { existsSync, mkdirSync, rmSync } from "fs";
import { basename, dirname, join } from "path";

const args = process.argv.slice(2);
const inputFile = args.find((a) => !a.startsWith("--"));
const outputFlag = args.indexOf("--output");
const outputPath =
  outputFlag !== -1 ? args[outputFlag + 1] : undefined;

if (!inputFile) {
  console.error("Usage: bun transcribe.ts <audio-file> [--output <path>]");
  process.exit(1);
}

if (!existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const outFile =
  outputPath || join(dirname(inputFile), `${basename(inputFile, "." + inputFile.split(".").pop())}.transcript.json`);

console.log(`Transcribing: ${inputFile}`);
console.log(`Output: ${outFile}`);

async function run(command: string[]): Promise<number> {
  const child = Bun.spawn({ cmd: command, stdout: "inherit", stderr: "inherit" });
  return await child.exited;
}

// MPS is Apple-only. Other platforms use the standard Whisper CLI.
const fastWhisper = process.platform === "darwin" ? Bun.which("insanely-fast-whisper") : null;
const whisper = Bun.which("whisper");

if (fastWhisper) {
  console.log("Using insanely-fast-whisper (MPS accelerated)...");
  const exitCode = await run([
    fastWhisper,
    "--file-name", inputFile,
    "--transcript-path", outFile,
    "--device-id", "mps",
    "--timestamp", "word",
    "--model-name", "openai/whisper-large-v3",
    "--batch-size", "4",
  ]);

  if (exitCode !== 0) {
    console.error("insanely-fast-whisper failed, trying standard whisper...");
  } else {
    console.log("Transcription complete.");
  }
}

if (!fastWhisper || !existsSync(outFile)) {
  if (!whisper) {
    console.error("No whisper variant found. Install: pip install openai-whisper");
    process.exit(1);
  }

  console.log("Using standard whisper...");
  const tmpDir = join(dirname(outFile), ".whisper-tmp");
  mkdirSync(tmpDir, { recursive: true });

  const exitCode = await run([
    whisper,
    inputFile,
    "--model", "medium",
    "--language", "en",
    "--word_timestamps", "True",
    "--output_format", "json",
    "--output_dir", tmpDir,
  ]);
  if (exitCode !== 0) {
    rmSync(tmpDir, { recursive: true, force: true });
    console.error(`Whisper failed with exit code ${exitCode}`);
    process.exit(1);
  }

  // Find and move the output
  const whisperOut = join(tmpDir, basename(inputFile).replace(/\.[^.]+$/, ".json"));
  if (existsSync(whisperOut)) {
    // Convert whisper format to insanely-fast-whisper format for consistency
    const data = JSON.parse(await Bun.file(whisperOut).text());
    const chunks: { text: string; timestamp: [number, number | null] }[] = [];

    for (const segment of data.segments || []) {
      for (const word of segment.words || []) {
        chunks.push({
          text: word.word,
          timestamp: [word.start, word.end],
        });
      }
    }

    const fullText = chunks.map((c) => c.text).join("");
    await Bun.write(outFile, JSON.stringify({ text: fullText, chunks }, null, 2));
    rmSync(tmpDir, { recursive: true, force: true });
    console.log("Transcription complete.");
  } else {
    console.error("Whisper produced no output.");
    rmSync(tmpDir, { recursive: true, force: true });
    process.exit(1);
  }
}

// Validate output
const transcript = JSON.parse(await Bun.file(outFile).text());
const chunkCount = transcript.chunks?.length || 0;
const textLen = transcript.text?.length || 0;
console.log(`Words: ${chunkCount} | Text: ${textLen} chars`);
console.log(`Saved: ${outFile}`);

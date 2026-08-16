# Analyze.ts

Hermes-native edit classification. Reads a word-level transcript and uses one bounded, tool-free Hermes inference turn to classify candidate cuts.

## Usage

```bash
bun $HERMES_HOME/skills/audio-editor/Tools/Analyze.ts <transcript.json> [--output <path>] [--aggressive]
```

## Options

| Flag | Description |
|------|-------------|
| `--output <path>` | Specify output JSON path (default: `<filename>.edits.json`) |
| `--aggressive` | Tighter thresholds: cuts single filler words, 1.5s pauses, and more word repetition |

## Classification Types

| Type | Description |
|------|-------------|
| `CUT_EDIT_MARKER` | Speaker says "edit" as a verbal cue (highest priority) |
| `CUT_STUTTER` | Unintentional word repetition ("the the", "I I") |
| `CUT_FALSE_START` | Abandoned sentence restart |
| `CUT_SELF_CORRECTION` | Speaker corrects themselves |
| `CUT_FILLER` | Standalone filler words ("um", "uh", "ah") |
| `CUT_DEAD_AIR` | Long pauses (>5s standard, >3s aggressive) |

## Output Format

```json
[
  {
    "type": "CUT_FILLER",
    "start": 12.5,
    "end": 13.1,
    "reason": "Standalone 'um' hesitation",
    "context": "and um we decided to",
    "confidence": 0.9
  }
]
```

## Requirements and consent

- The `hermes` CLI must be available, or `HERMES_INFERENCE_COMMAND_JSON` must contain a nonempty JSON string array naming an approved compatible command.
- Inference is fail-closed. Set `LIFEOS_INFERENCE_APPROVED=1` only for an explicitly approved run that may incur model cost.
- Model/provider overrides are optional and remain under the active Hermes configuration; this tool has no direct provider SDK or provider-specific credential contract.

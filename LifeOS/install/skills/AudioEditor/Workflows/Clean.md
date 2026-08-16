# Clean Workflow

Clean, edit, and polish audio files by removing filler words, stutters, false starts, dead air, and edit markers.

## Step 1: Locate the Audio File

Identify the audio file from the user's request. Check common locations:
- Explicit path provided by user
- `~/Downloads/` for recently downloaded files
- Use `search_files(target='files')` to locate matching `.mp3`, `.wav`, `.m4a`, or `.flac` files when needed.

If multiple matches exist, ask the user which file to use.

## Step 2: Determine Flags from Intent

Map the user's request to Pipeline.ts flags:

| User Says | Flag | Effect |
|-----------|------|--------|
| "preview", "show edits", "what would you cut" | `--preview` | Show proposed edits without executing |
| "aggressive", "tight", "heavy edit" | `--aggressive` | Tighter silence/filler thresholds |
| "polish", "cleanvoice", "final pass" | `--polish` | Cleanvoice API cloud polish (requires CLEANVOICE_API_KEY) |
| (default) | (none) | Standard cleaning with conservative thresholds |

## Step 3: Run the Pipeline

```bash
LIFEOS_INFERENCE_APPROVED=1 bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Pipeline.ts \
  "<audio-file-path>" \
  [FLAGS_FROM_INTENT_MAPPING] \
  --output "<output-path>"
```

**Output naming convention:** `<original-name>_edited.<ext>` in the same directory as the input file.

**Approval:** Set `LIFEOS_INFERENCE_APPROVED=1` only after the user approves the model calls. `--polish` separately requires content-egress and Cleanvoice cost approval.

**Timeout:** Set a 10-minute timeout. Local transcription of long files can take several minutes.

## Step 4: Report Results

After the pipeline completes, report:
- Number of edits applied
- Total time removed
- Original vs edited duration
- Output file path
- Artifacts generated (transcript, edits JSON, edited audio)

If `--preview` was used, display the edit list and ask if the user wants to proceed with execution.

## Individual Tool Usage

For debugging or partial workflows, individual tools can be run standalone:

```bash
# Transcription only
bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Transcribe.ts <file>

# Analysis only (requires transcript)
LIFEOS_INFERENCE_APPROVED=1 bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Analyze.ts <transcript.json>

# Edit only (requires audio + edits)
bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Edit.ts <file> <edits.json>

# Polish only (requires CLEANVOICE_API_KEY)
bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Polish.ts <file>
```

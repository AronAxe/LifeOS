---
name: AudioEditor
version: 1.0.22
description: "AI audio editing pipeline: Whisper word-level transcription → consent-gated Hermes segment classification (KEEP/CUT_FILLER/CUT_FALSE_START/CUT_STUTTER/CUT_DEAD_AIR) → ffmpeg with 40ms qsin crossfades and room-tone fill → optional Cleanvoice cloud polish. Distinguishes rhetorical from accidental pauses; breaths attenuated 50%. Modes: --preview, --aggressive, --polish. Workflow: Clean. USE WHEN clean audio, edit audio, remove filler words, clean podcast, remove ums, cut dead air, polish audio, trim recording, cut stutters. NOT FOR video composition (use Remotion)."
effort: medium
---

# AudioEditor

## Runtime Boundaries

- Resolve the active installed skill directory as `<AUDIO_EDITOR_SKILL_DIR>`; collision-safe imports may rename the directory.
- Treat the installed skill as read-only. Audio, transcripts, edit decisions, and rendered output remain beside the user-selected source or beneath a user-selected workspace.
- `Transcribe.ts` requires a local `whisper` CLI. Apple MPS acceleration is optional and used only on macOS when `insanely-fast-whisper` is available.
- `Analyze.ts` uses the configured Hermes model and refuses to run until the user approves inference cost for that run by setting `LIFEOS_INFERENCE_APPROVED=1`.
- `Polish.ts` uploads audio to Cleanvoice. Obtain explicit content-egress and cost approval before setting `CLEANVOICE_API_KEY` or invoking `--polish`.
- Notifications are optional and use Hermes-native messaging/TTS only when the user asks.

## What It Does

Cleans recorded audio automatically — strips filler words, false starts, stutters, and dead air, attenuates breaths, and crossfades every cut. It transcribes the file at the word level, has the configured Hermes model classify each segment (KEEP, CUT_FILLER, CUT_FALSE_START, CUT_STUTTER, CUT_DEAD_AIR), then executes the cuts with ffmpeg. An optional Cleanvoice pass adds final polish. Modes: --preview, --aggressive, --polish.

## The Problem

Cleaning a recording by hand means scrubbing a waveform for every "um," half-started sentence, and three-second silence, then crossfading each cut so it doesn't click. It's slow and tedious, and a blunt auto-tool over-cuts — it kills the rhetorical pause along with the accidental one, or leaves an audible seam where it spliced. This pipeline tells deliberate pauses apart from dead air, fills gaps with room tone, and crossfades each edit, so the output sounds clean rather than chopped.

## How It Works

Whisper produces word-level timestamps, the configured Hermes model classifies each segment (distinguishing rhetorical emphasis from accidental repetition), and ffmpeg executes the cuts with 40ms qsin crossfades, room-tone gap fill, and breath attenuation at 50% volume rather than removal. An optional Cleanvoice API pass handles mouth-sound removal, residual filler, and loudness normalization.

### Pipeline

```
Audio Input
    |
[Transcribe] Whisper word-level timestamps (insanely-fast-whisper on MPS)
    |
[Analyze] The configured Hermes model classifies each segment:
    |   KEEP / CUT_FILLER / CUT_FALSE_START / CUT_EDIT_MARKER / CUT_STUTTER / CUT_DEAD_AIR
    |   Distinguishes rhetorical emphasis from accidental repetition
    |
[Edit] ffmpeg executes cuts:
    |   - 40ms qsin crossfades at every edit point
    |   - Room tone extraction and gap filling
    |   - Breath attenuation (50% volume, not removal)
    |
[Polish] (optional) Cleanvoice API final pass:
        - Mouth sound removal
        - Remaining filler detection
        - Loudness normalization

Output: cleaned MP3/WAV
```

## Workflow Routing

| Workflow | Trigger | File |
|----------|---------|------|
| **Clean** | "clean audio", "edit audio", "remove filler words", "clean podcast", "remove ums", "cut dead air", "polish audio" | `Workflows/Clean.md` |

## Tools

| Tool | Command | Purpose |
|------|---------|---------|
| **Transcribe** | `bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Transcribe.ts <file>` | Word-level transcription via Whisper |
| **Analyze** | `bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Analyze.ts <transcript.json>` | Consent-gated Hermes edit classification |
| **Edit** | `bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Edit.ts <file> <edits.json>` | Execute cuts with crossfades + room tone |
| **Polish** | `bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Polish.ts <file>` | Cleanvoice API cloud polish |
| **Pipeline** | `bun <AUDIO_EDITOR_SKILL_DIR>/Tools/Pipeline.ts <file> [--polish]` | Full end-to-end pipeline |

## API Keys Required

| Service | Env Var | Where to Get |
|---------|---------|-------------|
| Hermes inference approval | `LIFEOS_INFERENCE_APPROVED=1` | Set only for an explicitly approved run; Hermes uses its configured provider/model |
| Cleanvoice (for polish step, optional) | `CLEANVOICE_API_KEY` | cleanvoice.ai Dashboard Settings API Key |

## Examples

**Example 1: Clean a podcast recording**
```
User: "clean up the audio on this podcast file"
-> Invokes Clean workflow
-> Runs full pipeline: transcribe -> analyze -> edit
-> Outputs cleaned MP3 with filler words, stutters, and dead air removed
```

**Example 2: Preview edits before applying**
```
User: "show me what edits you'd make to this recording"
-> Invokes Clean workflow with --preview flag
-> Transcribes and analyzes, shows proposed edits without modifying audio
-> User reviews edit list, then runs again to apply
```

**Example 3: Aggressive clean with cloud polish**
```
User: "aggressively clean this audio and polish it"
-> Invokes Clean workflow with --aggressive --polish flags
-> Tighter thresholds for filler detection
-> Cleanvoice API pass for mouth sounds and normalization
```

## Gotchas

- **Transcription accuracy varies with audio quality.** Background noise, multiple speakers, and accents reduce accuracy.
- **Cut detection is heuristic-based.** Always preview edits before committing — automated cuts can remove intentional pauses.
- **Cloud polish uploads audio to external service.** Confirm the user is okay with cloud processing for sensitive content.

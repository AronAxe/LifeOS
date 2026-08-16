# YouTube Extraction Workflow

## 1. Resolve the media

Confirm the canonical video/channel, URL or ID, title, channel, publication date, duration, and requested output. For playlists or channel batches, define the date/count boundary and persist an item manifest.

## 2. Acquire transcript evidence

Use an installed source-specific transcript tool when available; otherwise use a public caption/transcript route permitted by the source. Record:

```text
video_id, canonical_url, title, channel, published_at, duration,
transcript_source, language, auto_or_human, timing_available, retrieved_at
```

If captions are unavailable, do not reconstruct a transcript from title, description, comments, or model memory.

## 3. Normalize without erasing evidence

Preserve timestamps where possible. Mark inaudible/uncertain spans, language translation, auto-caption uncertainty, and speaker changes. Remove sponsor/repetition only when the user requested cleaned content, and keep a note of what was omitted.

## 4. Extract requested output

For summaries or research notes:

- separate speaker claims from researcher conclusions;
- attach timestamps to quotes, numbers, names, commands, and major claims;
- verify consequential names/numbers against transcript and visible metadata;
- preserve links or references mentioned by the speaker when recoverable;
- flag edits, outdated claims, and unsupported assertions.

For multi-video synthesis, keep per-video provenance before comparing themes.

## 5. Verify and deliver

Check metadata against the canonical page, spot-check transcript spans, verify quotes/timestamps, and report missing sections. Deliver the transcript or derived artifact with provenance and limitations. If retrieval fails, return only metadata actually obtained and the reason the transcript is unavailable.

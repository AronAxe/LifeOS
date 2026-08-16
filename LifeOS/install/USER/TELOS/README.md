---
provenance: template
---

# TELOS — Your Life Operating Goals

> 🎯 UPSTREAM SAMPLE TEMPLATES — These files document the source-system TELOS shape. HALOS does not deploy, populate, watch, or display them. The principal supplies a separate canonical TELOS source during consent-gated setup.

TELOS is your personal "why." These files describe what you're trying to do
with your life, what's getting in the way, and how you plan to handle it.
Upstream LifeOS read these files at session start. HALOS does not; a workflow reads configured TELOS only when required and consent permits it.

## Files

| File | What goes in it |
|------|------------------|
| `MISSION.md` | The 1–3 things you're putting your life behind. Big, durable, often unfinishable. |
| `GOALS.md` | Concrete year-scale goals tied to each mission. SMART-ish; revisited quarterly. |
| `PROBLEMS.md` | The world-level problems your work is trying to solve (vs. internal challenges). |
| `STRATEGIES.md` | The plays you've chosen to make progress on the problems. |
| `NARRATIVES.md` | The story you tell yourself and others about what you're doing and why. |
| `CHALLENGES.md` | Personal blockers — habits, fears, patterns that get in your way. |
| `BELIEFS.md` | The opinions and frames you operate from. The DA uses these to read drafts in your voice. |
| `WISDOM.md` | Lessons you've extracted from experience and want to keep applying. |
| `BOOKS.md` | Books that shaped you. Useful when the DA picks recommendations or framings. |
| `PRINCIPAL_TELOS.md` | Upstream generated summary; not generated or loaded by HALOS. |

## Subdirectories

| Dir | Purpose |
|-----|---------|
| `CURRENT_STATE/` | Where you are right now across the dimensions of your life — health, finances, relationships, work, learning. The DA uses this as the starting point for any "how do I get from here to there" question. Sample scaffolds inside. |
| `IDEAL_STATE/` | Where you want to be — the vision you're aiming at across the same dimensions. Sample scaffolds inside. |
| `Backups/` | Versioned snapshots of your TELOS files. Tools that bulk-edit TELOS write a backup here before changing anything. Empty until something is backed up. |

## How to fill these in

**Easiest:** run `/interview` after install. It walks you through each file
in order, asks the right questions, and writes your answers to disk —
replacing every `(sample)` entry with content that's actually yours.

**By hand:** open each `.md` file. The bootstrap content shows the shape —
delete the placeholders and write your real answers. Keep entries short and
high-signal; the DA reads everything in this directory at session start.

**From existing data:** if you already have goals/missions in Obsidian,
Notion, journal entries, or a Telos repo, run the **Migrate** skill before
`/interview` to import what you have. The interview will then fill gaps
instead of asking you to re-type things.

## Regenerate the summary

Whenever you edit a file in this directory, regenerate the summary so
session-start context stays in sync:

```bash
bun ~/.claude/LIFEOS/TOOLS/GenerateTelosSummary.ts
```

(`/interview` calls this automatically when it finishes a phase.)

## Privacy

This directory ships only as a bootstrap scaffold of samples. Anything you
write here stays on your machine and never reaches a public LifeOS release.
The release builder strips `LIFEOS/USER/**` and overlays a fresh sample
scaffold for each new installer.

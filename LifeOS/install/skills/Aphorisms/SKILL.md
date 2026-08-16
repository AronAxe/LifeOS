---
name: Aphorisms
version: 1.1.19
description: "Curated aphorism collection with CRUD — content-based matching, themed search, thinker research, DB maintenance. Quotes organized by author/theme/context/usage to prevent repetition. Four workflows: FindAphorism, AddAphorism, ResearchThinker, SearchAphorisms. Themes: Stoicism, Wisdom, Truth-seeking, Excellence, Resilience, Curiosity. USE WHEN aphorism, quote, find a quote, research thinker, add aphorism, quote for newsletter, what did X say about, quote bank. NOT FOR creative writing or social posts."
effort: low
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/LIFEOS/USER/CUSTOMIZATIONS/SKILLS/Aphorisms/`

If this directory exists, load and apply any PREFERENCES.md, configurations, or resources found there. These override default behavior. If the directory does not exist, proceed with skill defaults.


## 🚨 MANDATORY: Voice Notification (REQUIRED BEFORE ANY ACTION)

**You MUST send this notification BEFORE doing anything else when this skill is invoked.**

1. **Send voice notification**:
   ```bash
   curl -s -X POST http://localhost:31337/notify \
     -H "Content-Type: application/json" \
     -d '{"message": "Running the WORKFLOWNAME workflow in the Aphorisms skill to ACTION"}' \
     > /dev/null 2>&1 &
   ```

2. **Output text notification**:
   ```
   Running the **WorkflowName** workflow in the **Aphorisms** skill to ACTION...
   ```

**This is not optional. Execute this curl command immediately upon skill invocation.**

# Aphorisms

Curated aphorism store with full CRUD. **Deliverable: a ranked, non-repeated, attributed quote matched to the content's themes** — with a one-line reason per option. Adding parses text + author, assigns themes, records source, and dedupes. Research pulls a thinker's TELOS-aligned quotes and files them by theme with sources.

## Workflow Routing

**When executing a workflow, output this notification directly:**

```
Running the **WorkflowName** workflow in the **Aphorisms** skill to ACTION...
```

| Workflow | Trigger | File |
|----------|---------|------|
| FindAphorism | Find aphorism, quote for newsletter, match aphorism, suggest quote, aphorism recommendation | `Workflows/FindAphorism.md` |
| AddAphorism | Add quote, add aphorism, save quote, new aphorism, store quote | `Workflows/AddAphorism.md` |
| ResearchThinker | Research thinker, find quotes from, what did X say, thinker quotes on | `Workflows/ResearchThinker.md` |
| SearchAphorisms | Search aphorisms, find quotes on, quotes about, quotes matching, what aphorisms | `Workflows/SearchAphorisms.md` |

## Library contract

- **Mutable principal library:** set `APHORISMS_LIBRARY` to an absolute file outside the installed skill tree, normally `<LIFEOS_WORKSPACE>/skills/aphorisms/aphorisms.md`.
- **Packaged seed/reference:** `Database/aphorisms.md`, loaded with `skill_view(name="aphorisms", file_path="Database/aphorisms.md")`. It is read-only.
- Read workflows use the mutable library when configured; otherwise they may search the packaged seed without modifying it.
- Add, usage-history, and research-write workflows fail closed until `APHORISMS_LIBRARY` is configured. They must never patch `$HERMES_HOME/skills/aphorisms`.
- On first setup, propose copying the packaged seed to the approved external library and obtain consent before creating it.

The library is organized by author, theme, context, and usage history. Per-aphorism metadata includes full quote text, author attribution, theme tags, context/background, and source reference. Sections include Initial Collection, per-thinker sections, Theme Index, and Newsletter Usage History.

## Taxonomy (curated state)

**Themes:** Work Ethic & Excellence · Resilience & Strength · Learning & Education · Stoicism & Control · Risk & Action · Wisdom & Truth.

**TELOS-aligned thinkers** (wisdom, rationality, truth-seeking, human flourishing):
- **Christopher Hitchens** — intellectual honesty, skepticism, follow the evidence
- **David Deutsch** — optimistic epistemology, knowledge creation, explanations over predictions
- **Sam Harris** — scientific rationality applied to ethics, reason, mindfulness
- **Baruch Spinoza** — ethics from reason, freedom through understanding, acceptance
- **Richard Feynman** — curiosity, doubt as a tool, clarity, scientific honesty

## Gotchas

- **Search by theme, not exact text.** The collection is organized by conceptual themes, not keyword matching.
- **Always include attribution and source when adding new aphorisms.** Unattributed quotes are useless.
- **Duplicate detection:** Check if the aphorism already exists before adding. Same idea, different wording, still counts as duplicate.

## Execution Log

After completing any workflow, append a single JSONL entry:

```bash
echo '{"ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","skill":"Aphorisms","workflow":"WORKFLOW_USED","input":"8_WORD_SUMMARY","status":"ok|error","duration_s":SECONDS}' >> ~/.claude/LIFEOS/MEMORY/SKILLS/execution.jsonl
```

Replace `WORKFLOW_USED` with the workflow executed, `8_WORD_SUMMARY` with a brief input description, and `SECONDS` with approximate wall-clock time. Log `status: "error"` if the workflow failed.

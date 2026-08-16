---
name: telos
version: 2.0.0
category: LifeOS
portable: true
description: >
  Use for direct reads or approved updates to a principal-configured TELOS
  corpus, or for dependency/alignment analysis of a user-supplied project
  directory. Preserves source authority, backups, stable structure, and
  provenance; never invents a personal path or copies TELOS into memory.
---

# Telos — Configured Personal and Project Context

## Context routing

- **Personal TELOS:** the principal asks about their mission, goals, beliefs, strategies, projects, lessons, or another section in the configured TELOS corpus.
- **Project TELOS:** the principal supplies a project/directory and asks for dependency, goal, bottleneck, alignment, narrative, report, or dashboard analysis.
- **Conversational constitutional review:** use Interview.

If the route or source is ambiguous, inspect available context and ask the narrow question. Do not infer a source path.

## Personal TELOS

The source is principal-supplied during setup, such as a configured `TELOS_DIR`. HALOS ships no personal corpus, default location, fixed filenames, or principal identity.

### Read

1. Resolve the configured source and verify it exists.
2. Read only relevant files, plus indexes/metadata needed to interpret them.
3. Cite exact file/section evidence.
4. Treat the source as authoritative over Hindsight summaries.

### Update

Use `Workflows/Update.md`. Every mutation requires an explicit proposed target/content, approval, a recoverable backup or source-control rollback, a narrow edit, and read-back verification. Preserve stable IDs and local conventions. Do not retain the corpus wholesale in Hindsight.

## Project TELOS

For a user-supplied directory:

1. inventory relevant Markdown, CSV, structured data, and declared source-of-truth files;
2. extract entities and evidence-backed relationships;
3. map dependency chains such as problem → goal → strategy → project;
4. surface bottlenecks, contradictions, missing owners/evidence, progress, and risk;
5. generate only the requested artifact in an approved output directory.

Available formats include Markdown/JSON analysis, narrative points, evidence-backed reports, and the shipped interactive dashboard with dynamic Markdown/CSV viewing, consent-gated upload/edit, project/progress views, and an optional configured chat adapter. Use `Workflows/BuildDashboard.md` for the dashboard boundary. Building or running any web application requires explicit scope, dependency-install approval where applicable, and real build/smoke verification.

## Shipped resources

Resolve this installed skill's root as `<TELOS_SKILL_DIR>`; collision-safe imports may namespace it.

- `ReportTemplate/` — optional report application template
- `DashboardTemplate/` — optional dashboard template
- `Workflows/BuildDashboard.md`
- `Workflows/CreateNarrativePoints.md`
- `Workflows/InterviewExtraction.md`
- `Workflows/Update.md`
- `Workflows/WriteReport.md`

No hidden `_TELOS` skill, update executable, voice service, automatic changelog, or background refresh is installed.

## Safety

TELOS may contain highly sensitive identity and health material. Minimize reads, avoid external egress unless approved, keep public outputs sanitized, and never convert absence of configuration into permission to scaffold or migrate.

# Daemon Security Classification

Defines what data is public vs private for daemon aggregation. The aggregator uses this as its allowlist — only explicitly public content passes through.

## Core Principle

**Private by default. Promote known-safe.** Every field must be explicitly classified as public before the aggregator includes it. Unknown data is excluded.

## Source Classification

### ALWAYS PUBLIC (safe to publish verbatim)

| Source | Fields | Notes |
|--------|--------|-------|
| TELOS/BOOKS.md | All titles | Book preferences are public |
| TELOS/MOVIES.md | All titles | Movie preferences are public |
| TELOS/WISDOM.md | All quotes | Philosophical quotes, no PII |
| TELOS/MISSION.md | Public missions only | Philosophical / craft missions |
| daemon data: predictions | All | Public predictions with confidence |
| daemon data: daily_routine | All | Generic routine, no locations |
| daemon data: podcasts | All | Public preferences |

### PUBLIC WITH FILTERING (safe after security filter applied)

| Source | Public Fields | Filtered Out |
|--------|--------------|-------------|
| TELOS/GOALS.md | Public project goals | Revenue targets, follower counts, private repos |
| TELOS/MISSION.md | Public missions | Missions referencing private people |
| TELOS/CHALLENGES.md | General self-improvement challenges | Any referencing private people |
| PRINCIPAL_IDENTITY.md | Role, focus, career, interests, worldview | Partner name, private contacts |
| PROJECTS.md | Public repos and sites only | Private repos, internal tools |
| KNOWLEDGE/Ideas/ | Title + thesis only | Evidence, implications, internal refs |
| MEMORY/WORK/ | Abstracted topic themes | ISA details, task slugs, client info |
| daemon data: preferences | Generic preferences | Internal tooling specifics |
| daemon data: about | Bio text | Private names, internal paths |

### STRUCTURALLY EXCLUDED (aggregator never reads these)

| Source | Reason |
|--------|--------|
| `<LIFEOS_DIR>/USER/CONTACTS.md` | Contains real names, emails, phones |
| `<LIFEOS_DIR>/USER/FINANCES/` | Financial data |
| `<LIFEOS_DIR>/USER/HEALTH/` | Health data |
| `<LIFEOS_DIR>/USER/TELOS/TRAUMAS.md` | Deeply personal |
| `<LIFEOS_DIR>/USER/BUSINESS/` | Business confidential |
| `<LIFEOS_DIR>/MEMORY/KNOWLEDGE/People/` | OSINT dossiers, consent not given |
| `<LIFEOS_DIR>/MEMORY/KNOWLEDGE/Companies/` | May contain proprietary intel |
| Any .env, .key, .pem file | Credentials |

### PROJECTS PUBLIC/PRIVATE CLASSIFICATION

The classification is config-driven, not hardcoded. `LIFEOS_DAEMON_PUBLIC_PROJECTS` is a comma-separated allowlist of project identifiers or repository URLs and is empty by default. `LIFEOS_DAEMON_PUBLIC_MISSION_IDS`, `LIFEOS_DAEMON_PUBLIC_GOAL_IDS`, and `LIFEOS_DAEMON_PUBLIC_SECTIONS` provide equally explicit field-level promotion.

If a project does not appear in the allowlist, the aggregator defaults to **exclude** (private by default). This file does not enumerate any specific project names — those values remain in principal-controlled configuration, never in the public skill source.

## Entity Blocklist

These categories must never appear in public output. The SecurityFilter enforces them deterministically. **The literal values live in user-zone config files, NEVER in this public doc** — listing them here would itself be the leak this filter is designed to prevent.

### Names

The aggregator reads additional blocked names only from the principal-supplied `<LIFEOS_DIR>/USER/SKILLCUSTOMIZATIONS/Daemon/SecurityOverrides.md`. The default list is empty. The aggregator does not infer contacts or read a hidden profile.

### Aliases and Abbreviations

- Single-letter abbreviations used as person references (e.g., "X" / "B" / "M" when followed by identifying context like "X's calendar", "me and B")
- Relationship words ("my partner", "my girlfriend", "my mom") when followed by identifying context

These pattern classes are baked into the filter. Specific names that match them are sourced from user config (above), never enumerated here.

### Paths

The aggregator strips any path that matches:

- `/Users/<your-username>/` (or `/home/<your-username>/` on Linux) — strips your home dir from any output
- hidden assistant configuration directories — internal paths that must not enter public output
- Common cloud-storage mount points and typical local-project root dirs

User-specific additional path patterns can be added under `## Additional Excluded Paths` in the same explicit `SecurityOverrides.md` file.

### Credentials

- Any string matching common secret-token shapes such as `sk-*` or `ghp_*`
- Any string matching: `*_API_KEY`, `*_TOKEN`, `*_SECRET`

### Internal Architecture

- LifeOS internal system names when used as implementation details
- Hook filenames, tool paths, internal pipeline names
- Pulse port numbers, internal API endpoints

## Customization

Users customize deterministic name/path redaction in the configured source tree:

```
<LIFEOS_DIR>/USER/SKILLCUSTOMIZATIONS/Daemon/SecurityOverrides.md
```

Override file format:

```markdown
## Additional Blocked Names
- Name1
- Name2

## Additional Excluded Paths
- /path/to/exclude
```

Public projects and sections are promoted only through the `LIFEOS_DAEMON_PUBLIC_*` environment allowlists described above; they are not read from this override file.

Why config-driven, not hardcoded: if this file enumerated any specific user's contacts, projects, or paths, then *publishing this file* would itself leak that data — exactly what the filter is supposed to prevent. The filter's *categories* are public; specific values remain in the explicitly configured principal source.

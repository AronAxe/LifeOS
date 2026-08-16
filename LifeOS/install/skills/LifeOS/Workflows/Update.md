# Update — idempotent re-overlay

Brings an existing install up to the current HALOS version without touching the user's data. Safe to run repeatedly.

*(Note: LifeOS is upstream doctrine and a legacy package/skill name only where an exact path or command demands it.)*

## Requirements

- Hermes CLI
- Bun
- Filesystem and terminal access

## Steps

### 1. Identify HERMES_HOME

Inspect and choose the `HERMES_HOME` directory without changing it.

### 2. Import Skills & Plugin (Dry-Run)

Run the importer in dry-run mode:
```bash
bun LifeOS/Tools/ImportSkills.ts --dry-run
```
Show the plan and resolve any collisions. The importer detects collision without overwrite. Obtain explicit consent.

### 3. Execute Importer

```bash
bun LifeOS/Tools/ImportSkills.ts
```
This is an additive importer apply. Import never overwrites files.

### 4. Optional Plugin Status

If the `lifeos` plugin is enabled, run:
```bash
hermes lifeos status
```

### 5. Settings Reclassification

Run the settings installer:
```bash
bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home <selected-dir> --dry-run
```
Review the classifications with the user. Request consent before running with `--apply` for the verified operations (`BASH_DEFAULT_TIMEOUT_MS` -> `terminal.timeout` and `fileCheckpointingEnabled` -> `checkpoints.enabled`).

Never write a live config automatically. No env migration.

---

## ⚠️ Capability Boundary Warning

Do not use legacy scripts (`DeployCore`, `DeployComponents`, `InstallHooks`, `ActivateImports`), user-tree/symlink operations, CLAUDE launchers, Claude `settings.json` mergers, or launchd/Pulse runtime. They are not Hermes adapters and must not be invoked.

The native plugin covers exactly its public surface:
- Tools: `lifeos_isa`, `lifeos_events`, `lifeos_public_profile`, `lifeos_status`
- Passive evidence hooks: `on_session_start`, `on_session_end`, `post_tool_call`
- Commands: `/lifeos status`, `hermes lifeos status`

Passive plugin hooks do not inject a constitution, policy, identity or automatic agent control. `lifeos_isa` is explicit opt-in working state; it does not auto-advance phases. Ascent labels are not persisted/scheduled. Missing native equivalents are limitations.

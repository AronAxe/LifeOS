# Setup — system integration (phase 1)

Wires HALOS into the user's Hermes machine. Runs FIRST, always.

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
Show the plan and any collisions to the human. The importer detects collision without overwrite and refuses maintainer targets. Obtain explicit consent.

### 3. Execute Importer

```bash
bun LifeOS/Tools/ImportSkills.ts
```

### 4. Enable and Verify

1. Run `hermes skills list`.
2. Ask the user if they want to enable the `lifeos` plugin.
3. Only if enabled, run `hermes lifeos status`.

### 5. Settings Configuration

Run the deployed `InstallSettings.ts`:
```bash
bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home <selected-dir> --dry-run
```
Review classifications with the user. The script only maps `BASH_DEFAULT_TIMEOUT_MS` -> `terminal.timeout` (seconds) and `fileCheckpointingEnabled` -> `checkpoints.enabled`.
Separately request consent before running with `--apply`.

Never write a live config automatically. No env migration.

### 6. Onboarding

- TELOS source is a principal-supplied configured path.
- General knowledge belongs in configured Hindsight.
- Do not create an invented `USER` tree, symlinks, private paths/namespaces, automatic identity context or Pulse seeding.
- Safety: Maintain dry-runs, collision no-overwrite, maintainer refusal, and user confirmation.

---

## ⚠️ Capability Boundary Warning

Legacy scripts (`DeployCore`, `DeployComponents`, `InstallHooks`, `ActivateImports`, user-tree/symlink operations, CLAUDE launchers, Claude `settings.json`, launchd/Pulse) are **not Hermes adapters** and **must not be invoked**.

The native plugin covers only:
- Tools: `lifeos_isa`, `lifeos_events`, `lifeos_public_profile`, `lifeos_status`
- Passive hooks: `on_session_start`, `on_session_end`, `post_tool_call`
- Commands: `/lifeos status`, `hermes lifeos status`

Passive plugin hooks do not inject a constitution, policy, identity or automatic agent control. `lifeos_isa` is explicit opt-in working state; it does not auto-advance phases. Ascent labels are not persisted/scheduled. Missing native equivalents are limitations/future adapters; do not claim full parity.

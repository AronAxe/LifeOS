# Setup — HALOS on Hermes (Phase 1)

Wires HALOS (upstream LifeOS) into the user's Hermes machine.

## Safe Ordered Setup Steps

### 1. Prerequisites
Confirm **Hermes CLI** and **bun** are present, alongside normal filesystem/command access.

### 2. Locate HERMES_HOME
Locate and choose the target `HERMES_HOME`. Do not change it live.

### 3. Import Skills (Dry-Run)
Run the import tool in dry-run mode:
```bash
bun LifeOS/Tools/ImportSkills.ts --dry-run
```
Show the plan and collisions, and get explicit principal consent. The tool plans all 72 public skills for `HERMES_HOME/skills` and the native plugin for `HERMES_HOME/plugins`; a clean target receives the complete public set.

### 4. Run Import
Run the actual import:
```bash
bun LifeOS/Tools/ImportSkills.ts
```

### 5. Enable Plugin
Explicitly enable the imported `lifeos` plugin if desired:
```bash
hermes plugins enable lifeos
hermes plugins list --enabled
hermes skills list --source local
```
Verify functionality only after plugin enablement. The plugin provides `lifeos_isa`, `lifeos_events`, `lifeos_public_profile`, `lifeos_status`, session hooks, and `/lifeos status`.

### 6. Install Settings
Run the settings deployment in dry-run mode:
```bash
bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home <selected-dir> --dry-run
```
Review the classifications. It only maps `BASH_DEFAULT_TIMEOUT_MS` -> `terminal.timeout` and `fileCheckpointingEnabled` -> `checkpoints.enabled`. **Do NOT automatically invoke apply / write config.** Wait for explicit consent before separately choosing its two verified config operations.

### 7. Onboarding
- Ensure the TELOS source is a principal-supplied configured path.
- Use Hindsight for general knowledge where configured.
- Do not invent a USER tree, symlinks, private paths/namespaces, or auto Pulse seeding.

## Hard Boundaries
- **No legacy adapters:** Do not invoke Claude launchers, `settings.json` hook mergers, `@LIFEOS` imports, launchd/Pulse services, or user-tree symlinks.
- **Plugin limits:** The native plugin covers only its documented tools/hooks/status. It does not replace unimplemented historical behavior.
- **Lifecycle hooks:** Treat plugin hooks as passive operational evidence. They do not inject constitution, policy, identity, or automatic agent control.
- `/lifeos status` is explicit opt-in state. Ascent labels are not persisted/scheduled.

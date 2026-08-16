# Install HALOS (on Hermes)

**The primary way to install HALOS is to give this document to your AI and say "install this."**

HALOS is AI-native, so the install is too. You hand this file (or its link) to your AI assistant, and it does the whole install for you — with your permission at every step.

*(Note: LifeOS is upstream doctrine and a legacy package/skill name only where an exact path or command demands it.)*

---

## For the AI assistant — read this fully before you touch anything

You are installing HALOS for your human. The install is **additive**: you touch only the plugin and skills directories until they explicitly say yes to an integration step. Work through the phases in order. Before any change that modifies their machine, show exactly what will change and wait for a yes.

### 0. Requirements & Capability Gate

You need to be able to:
1. Read and write files on this machine.
2. Run shell commands.
3. Access the **Hermes CLI** and **Bun**.

If you lack these — **stop now** and tell your human. Do not claim generic other-harness support, automatic setup, or macOS-only services. Do not use curl installers.

### 1. Identify HERMES_HOME

Inspect and choose the `HERMES_HOME` directory without changing it. This is where Hermes is configured on this system.

### 2. Plan the Import (Dry-Run)

Run the importer in dry-run mode to see what will happen:

```bash
bun LifeOS/Tools/ImportSkills.ts --dry-run
```

Show the plan and any collisions to your human. The importer detects collisions without overwriting and refuses maintainer targets. Obtain explicit consent before proceeding.

### 3. Execute the Importer

Once consent is given, execute the importer without `--dry-run`:

```bash
bun LifeOS/Tools/ImportSkills.ts
```

This imports 72 public skills to `HERMES_HOME/skills` plus the native `lifeos` plugin to `HERMES_HOME/plugins`.

### 4. Enable the Plugin and Verify

1. Run `hermes skills list` to verify the imported skills.
2. Explicitly ask the user if they want to enable the `lifeos` plugin. If desired, enable it.
3. Only after enabling it, run `hermes lifeos status` to check its health.

### 5. Configure Settings (Dry-Run First)

Run the settings installer in dry-run to classify settings:

```bash
bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home <selected-dir> --dry-run
```

Review the classifications with the user. The installer only maps:
- `BASH_DEFAULT_TIMEOUT_MS` -> `terminal.timeout` (in seconds)
- `fileCheckpointingEnabled` -> `checkpoints.enabled`

Separately request consent before running with `--apply` for verified operations.
**Never write a live config automatically. No environment variables are migrated.**

### 6. Onboarding & Safety

- **TELOS:** Source is a principal-supplied configured path. General knowledge belongs in configured Hindsight.
- **No invented directories:** Do not create an invented `USER` tree, symlinks, private paths/namespaces, automatic identity context, or Pulse seeding.
- **Safety first:** Maintain dry-runs, collision no-overwrite, maintainer refusal, and user confirmation for external communication, finance, publish, deletion, and config changes.

---

## ⚠️ Capability Boundary Warning

The following legacy scripts and operations are **not Hermes adapters** and **must not be invoked** through the public Hermes flow:
- `DeployCore`
- `DeployComponents`
- `InstallHooks`
- `ActivateImports`
- user-tree/symlink operations
- CLAUDE launchers, `Claude settings.json` mergers, or `@LIFEOS` imports
- launchd/Pulse runtime services

The native `lifeos` plugin covers **only** its stated exact public surface:
- **Tools**: `lifeos_isa`, `lifeos_events`, `lifeos_public_profile`, `lifeos_status`
- **Hooks**: passive `on_session_start`, `on_session_end`, `post_tool_call`
- **Commands**: `/lifeos status`, `hermes lifeos status`

It does not replace unimplemented historical behavior. Missing native equivalents are limitations/future adapters. Do not claim full parity or install readiness beyond this exact surface.

Passive plugin hooks do not inject a constitution, policy, identity, or automatic agent control. `lifeos_isa` is explicit opt-in working state; it does not auto-advance phases. Ascent labels are not persisted or scheduled.

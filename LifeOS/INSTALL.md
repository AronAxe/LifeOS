# Install HALOS on Hermes

HALOS is the Hermes-native port of LifeOS doctrine. This repository supports **Hermes only**. It does not install the upstream Claude Code runtime, Pulse, launchd services, a user filesystem tree, or any hidden context system.

## Agent-first route

For a complete, consent-gated installation, point a Hermes-capable agent at [`SKILL.md`](SKILL.md) in this release checkout and ask it to install HALOS. The bootstrap skill proves the checkout and selected target, performs the dry-run, pauses for each required decision, imports, offers plugin activation, classifies settings, verifies the result, and reports the evidence.

The manual sequence below is the same contract. In every command, replace `<selected-hermes-home>` with the principal-approved target; do not rely on an ambient profile.

## Before beginning

The operator needs:

- Hermes CLI;
- Bun;
- filesystem and terminal access; and
- an explicit decision about the target `HERMES_HOME`.

The installation is additive. It never overwrites a differing existing skill, and it refuses a maintainer/source target carrying the private `_LIFEOS` marker.

## 1. Preview the import

From the repository root, inspect the complete plan before anything is written:

```bash
HERMES_HOME="<selected-hermes-home>" bun LifeOS/Tools/ImportSkills.ts --dry-run
```

Review the target, skill/plugin counts, identical entries, and conflicts. A conflict is preserved rather than overwritten. Resolve it deliberately; do not treat a dry-run as permission to proceed.

## 2. Import after consent

When the operator approves the plan:

```bash
HERMES_HOME="<selected-hermes-home>" bun LifeOS/Tools/ImportSkills.ts
```

The importer plans all 72 public skills for `$HERMES_HOME/skills/` and the native `lifeos` plugin for `$HERMES_HOME/plugins/`. A clean target receives the complete public set; a collision is preserved rather than overwritten. Private `_ALLCAPS` material is never distributed.

## 3. Enable and verify the optional plugin

The plugin is trusted code. Enable it only after an explicit decision:

```bash
HERMES_HOME="<selected-hermes-home>" hermes plugins enable lifeos
HERMES_HOME="<selected-hermes-home>" hermes plugins list --enabled
HERMES_HOME="<selected-hermes-home>" hermes skills list --source local
```

In an already running interactive session, use `/reload-skills` to rescan the newly imported skills. A fresh session reads the installed skill set normally. If the plugin is enabled, its status command is available:

```bash
HERMES_HOME="<selected-hermes-home>" hermes lifeos status
```

The plugin surface is limited to `lifeos_isa`, `lifeos_events`, `lifeos_public_profile`, `lifeos_status`, its passive lifecycle hooks, and its status commands. It does not inject identity, policy, a constitution, or an automatic task controller.

## 4. Classify settings separately

The settings adapter is dry-run by default. It does not migrate secrets, Claude permissions, hooks, plugins, or arbitrary environment variables.

```bash
HERMES_HOME="<selected-hermes-home>" bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home "<selected-hermes-home>" --dry-run
```

Review its structured report. It maps only these verified settings:

- `BASH_DEFAULT_TIMEOUT_MS` → `terminal.timeout` (milliseconds converted to seconds);
- `fileCheckpointingEnabled` → `checkpoints.enabled`.

Running the adapter with `--apply` is a separate, explicit configuration decision. It applies only the operations shown in the reviewed report.

## 5. Onboard without inventing state

The TELOS source is a **principal-supplied configured path**. General knowledge belongs in configured Hindsight. The onboarding workflow may capture what the principal chooses to share, but it must not create a `USER` tree, fabricate identity records, seed Pulse, schedule jobs, or treat unaccepted interpretation as durable memory.

## Boundaries

Do not invoke `DeployCore`, `DeployComponents`, `InstallHooks`, `ActivateImports`, Claude launchers, `settings.json` mergers, `@LIFEOS` imports, user-tree/symlink operations, or launchd/Pulse services. They are upstream mechanisms, not HALOS-on-Hermes adapters.

For the installed skill’s assistant-facing workflow, see [`install/skills/LifeOS/INSTALL.md`](install/skills/LifeOS/INSTALL.md). That file and this guide describe the same supported installation contract.

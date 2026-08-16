---
name: LifeOS
version: 1.4.19
description: Bootstrap and verify a consent-gated HALOS installation on Hermes.
disable-model-invocation: true
argument-hint: "[install|update|onboard|remove]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# HALOS Bootstrap Installer

Point a Hermes-capable agent at **this `LifeOS/SKILL.md` file** from a complete HALOS release checkout and ask it to install HALOS. This is the single agent-operable installation entry point. It carries the procedure for discovery, dry-run, consent-gated import, optional plugin activation, settings classification, verification, and a precise handoff.

It installs the Hermes-native HALOS port. It does **not** recreate the retired Claude Code, Pulse, launchd, file-memory, user-tree, symlink, or automatic-constitution runtime.

## When to use

Use this skill when a principal asks to:

- install HALOS or LifeOS on Hermes from a release checkout;
- preview, complete, or verify a HALOS import;
- update an existing HALOS import without overwriting local work;
- begin consent-based TELOS/Hindsight onboarding after installation; or
- assess a safe, manual removal boundary.

Do not use it to modify a live Hermes installation merely because this file was read. A dry-run is safe discovery; import, plugin enablement, settings application, onboarding writes, scheduling, deletion, and external activity remain separate decisions.

## Required input

Derive `PACKAGE_ROOT` as the directory containing this `SKILL.md`. Before any action, use `read_file` or `terminal` to verify that all three release artifacts exist relative to it:

- `Tools/ImportSkills.ts`;
- `install/skills/LifeOS/Tools/InstallSettings.ts`; and
- `install/plugins/lifeos/plugin.yaml`.

If any are absent, this is an installed skill copy rather than a complete release. State that a release checkout is required and do not improvise an importer.

Ask for or inspect the intended `HERMES_HOME`. Use `terminal` to run `hermes config path` and explain the target. If the requested target differs from the active profile, require the principal to name it explicitly. Pass that exact target as `HERMES_HOME` to **every** Hermes CLI and installer command; never rely on an ambient profile by accident.

In the command examples below, set `HALOS_PACKAGE_ROOT` to the directory containing this `SKILL.md` and `HALOS_HERMES_HOME` to the selected Hermes home. Both values must be quoted. They are release-local and principal-selected values, never hard-coded paths.

## Agent-run installation procedure

### 1. Establish prerequisites and target

Use `terminal` for read-only checks:

```bash
hermes --version
bun --version
hermes plugins enable --help
hermes skills list --help
```

Confirm a complete release checkout and a selected `HERMES_HOME`. Do not create or alter the target during this step. Completion criterion: the agent can name the package root, target Hermes home, prerequisites, and any blocker.

### 2. Produce the import plan

Use the selected target explicitly. In a POSIX shell, the command is:

```bash
HERMES_HOME="$HALOS_HERMES_HOME" bun "$HALOS_PACKAGE_ROOT/Tools/ImportSkills.ts" --dry-run
```

On another terminal backend, set the same `HERMES_HOME` environment variable using that backend’s native syntax. Read the complete report. Surface its target, planned skills/plugins, private-skill count, identical entries, conflicts, and maintainer-target refusal. Do not state a fixed installed count when collisions change the plan.

Completion criterion: the principal has seen the exact dry-run output and the agent has made no filesystem or configuration mutation.

### 3. Obtain the import decision

Ask one focused question: whether to apply the reviewed import plan to the selected target. Do not infer approval from “continue,” from the initial request to inspect the skill, or from an unrelated permission. If the principal declines or does not answer, stop after preserving the dry-run evidence.

Only after explicit approval, run:

```bash
HERMES_HOME="$HALOS_HERMES_HOME" bun "$HALOS_PACKAGE_ROOT/Tools/ImportSkills.ts"
```

Read the result. If the importer reports a conflict, do not overwrite or delete anything; explain the conflicting target and present the preserved `lifeos-<name>` outcome or manual decision needed.

Completion criterion: the output confirms the actual target and every planned result is classified as installed, identical/skipped, conflict/preserved, invalid, or private/skipped.

### 4. Offer plugin activation separately

The `lifeos` plugin is trusted executable code. Ask separately whether to enable it. If approved, use the selected target for every command:

```bash
HERMES_HOME="$HALOS_HERMES_HOME" hermes plugins enable lifeos
HERMES_HOME="$HALOS_HERMES_HOME" hermes plugins list --enabled
HERMES_HOME="$HALOS_HERMES_HOME" hermes skills list --source local
HERMES_HOME="$HALOS_HERMES_HOME" hermes lifeos status
```

If the plugin is not approved, verify the imported skills but report that plugin-dependent tools and status are intentionally unavailable. In an already-active interactive session, `/reload-skills` rescans new skills; a fresh session does not need it.

Completion criterion: plugin activation is either verified with command output or explicitly declined, never assumed from files being present.

### 5. Classify configuration without guessing

Run the settings adapter as a dry-run against the same selected target:

```bash
HERMES_HOME="$HALOS_HERMES_HOME" bun "$HALOS_PACKAGE_ROOT/install/skills/LifeOS/Tools/InstallSettings.ts" --hermes-home "$HALOS_HERMES_HOME" --dry-run
```

Present its structured report. It may apply only its declared verified mappings:

- `BASH_DEFAULT_TIMEOUT_MS` → `terminal.timeout` (milliseconds to seconds);
- `fileCheckpointingEnabled` → `checkpoints.enabled`.

Do not migrate environment variables, secrets, permissions, hooks, plugins, provider choices, remote-control settings, or any `requires-principal-decision` / `unsupported` item.

Ask separately whether to apply precisely the reported operations. Only after approval run the same command with `--apply`, then read its JSON report and run `HERMES_HOME="$HALOS_HERMES_HOME" hermes config check`. If the adapter fails after creating a backup, report the backup path and stop rather than guessing at a repair.

Completion criterion: config is either unchanged after a documented dry-run or each applied operation, verification result, and backup path is recorded.

### 6. Offer onboarding as a later conversation

Do not seed identity, TELOS, memory, Pulse, cron, project context, or a dashboard during installation. Offer the `install/skills/LifeOS/Workflows/Interview.md` conversation only after the installation handoff.

TELOS is a principal-supplied configured source. General knowledge, entities, and relationships may go to configured Hindsight only with permission and only after the provider is healthy. Keep active decisions and unfinished synthesis in the session/workspace.

Completion criterion: any onboarding is explicitly chosen and its intended writes are shown before they happen.

## Update and removal

For an update, repeat the dry-run/import/verification sequence. The importer is additive and collision-preserving; it is not an overwrite deployer.

No automated public uninstaller exists. For removal, inventory the selected target, source checkout, plugin, local `lifeos-*` skills, TELOS sources, and Hindsight data separately. Show ownership and target lists, then require an explicit removal decision. Never delete broad Hermes directories, configuration, Hindsight data, source material, or principal records by implication.

## Boundaries

Never invoke `DeployCore`, `DeployComponents`, `InstallHooks`, `ActivateImports`, the upstream shell installer, Claude launchers, Claude `settings.json` merging, `@LIFEOS` imports, user-tree/symlink operations, launchd, or Pulse. They are not HALOS-on-Hermes adapters.

The optional plugin provides only its documented explicit tools, passive evidence hooks, and commands. It does not automatically inject a constitution, identity, policy, scheduling, phase advancement, or agent control.

## Final handoff

Report, in order:

1. release package root and selected `HERMES_HOME`;
2. prerequisite results;
3. dry-run/import outcome and all collisions or refusals;
4. plugin decision and verification result;
5. settings decision, operations applied or declined, and config check result;
6. onboarding state—offered, started, or intentionally deferred; and
7. every limitation or unresolved decision.

Do not claim success solely because files copied. The installation is complete only when every approved operation has evidence and every unapproved operation remains untouched.

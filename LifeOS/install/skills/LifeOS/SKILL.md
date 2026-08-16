---
name: LifeOS
version: 1.4.19
description: Bootstrap and verify a consent-gated HALOS installation on Hermes.
disable-model-invocation: true
argument-hint: "[install|update|onboard|remove]"
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# HALOS Bootstrap Installer

This is the installed HALOS lifecycle skill. For a first installation, point an agent at `LifeOS/SKILL.md` in the complete release checkout; the checkout supplies `Tools/ImportSkills.ts` and the public payload. Once imported, this skill governs verified updates, settings classification, onboarding offers, and removal review on Hermes.

HALOS is the Hermes-native port of LifeOS doctrine. It does not recreate the retired Claude Code, Pulse, launchd, file-memory, user-tree, symlink, or automatic-constitution runtime.

## When to use

Use when a principal asks to install, update, verify, onboard, or assess removal of HALOS on Hermes. Do not use to cut a release or to mutate a machine merely because the skill was read.

## Operating contract

1. **Identify the release and target.** For first install, prove the release checkout contains `Tools/ImportSkills.ts`, `install/skills/LifeOS/Tools/InstallSettings.ts`, and `install/plugins/lifeos/plugin.yaml`. Inspect the selected `HERMES_HOME`; require an explicit target if it differs from the active profile.
2. **Dry-run first.** Run `HERMES_HOME="<selected>" bun "<package-root>/Tools/ImportSkills.ts" --dry-run`, read the full report, and show planned skills/plugins, private count, collisions, and refusals. No mutation has occurred at this point.
3. **Consent before import.** Apply only after an explicit approval of that plan: `HERMES_HOME="<selected>" bun "<package-root>/Tools/ImportSkills.ts"`. Preserve collisions; never overwrite, delete, or infer a conflict decision.
4. **Consent before plugin activation.** The copied plugin is not active merely because it exists. If approved, run `HERMES_HOME="<selected>" hermes plugins enable lifeos`, then verify with `hermes plugins list --enabled`, `hermes skills list --source local`, and `hermes lifeos status`, each using the same target environment.
5. **Classify settings separately.** Run `HERMES_HOME="<selected>" bun "<package-root>/install/skills/LifeOS/Tools/InstallSettings.ts" --hermes-home "<selected>" --dry-run`. Present the report. Only `BASH_DEFAULT_TIMEOUT_MS` → `terminal.timeout` and `fileCheckpointingEnabled` → `checkpoints.enabled` are verified mappings. Apply only after a separate approval, then run `hermes config check` against the same target.
6. **Offer onboarding, do not assume it.** TELOS is a principal-supplied configured source. General knowledge belongs in configured Hindsight only with permission and a healthy provider. Do not create a user tree, seed identity/Pulse, create project context, schedule work, or retain unaccepted interpretation.

The full first-install procedure, decision boundaries, command forms, and evidence handoff are in the source bootstrap skill at `LifeOS/SKILL.md`. If that complete release checkout is unavailable, stop and request it rather than improvising an installer.

## Update and removal

Updates repeat dry-run → consent → additive import → optional plugin verification → separate settings decision. The importer preserves conflicts; it is not an overwrite deployer.

No public automated uninstaller is implemented. Inventory the selected target, plugin, locally imported skills, release checkout, TELOS sources, and Hindsight data separately. Require an explicit, reviewed target list before any removal. Never delete broad Hermes directories, configuration, Hindsight data, source material, or principal records by implication.

## Boundaries

Do not invoke `DeployCore`, `DeployComponents`, `InstallHooks`, `ActivateImports`, the upstream shell installer, Claude launchers, Claude `settings.json` merging, `@LIFEOS` imports, user-tree/symlink operations, launchd, or Pulse. These are upstream mechanisms, not HALOS-on-Hermes adapters.

The optional plugin provides its documented explicit tools, passive evidence hooks, and commands. It does not automatically inject identity, policy, constitution, scheduling, phase advancement, or agent control.

## Evidence handoff

Report the release root, selected `HERMES_HOME`, prerequisite evidence, dry-run/import result, collision/refusal status, plugin decision and verification, settings decision and config check, onboarding state, and every remaining limitation. Success requires evidence for each approved operation, not merely copied files.

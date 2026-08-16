<p align="center">
  <br />
  <img src="./images/lifeos-logo-full.png" alt="Life OS for Hermes" width="460">
  <br />
</p>

<h1 align="center">Life OS for Hermes</h1>

<p align="center">
  A consent-gated Hermes port of the public LifeOS skills, doctrine, and workflows.
</p>

<p align="center">
  <a href="#install-with-an-agent"><strong>Install with an agent</strong></a> ·
  <a href="LifeOS/INSTALL.md"><strong>Installation guide</strong></a> ·
  <a href="SECURITY.md"><strong>Security</strong></a> ·
  <a href="LICENSE"><strong>MIT License</strong></a>
</p>

---

> [!IMPORTANT]
> This repository supports **Hermes Agent only**. It is a portable port of the public LifeOS system, not the upstream Claude Code installer. It does not install or emulate the retired Claude-specific runtime, Pulse, launchd services, hidden filesystem memory, personal data, or scheduled jobs.

## What this is

Life OS for Hermes packages the public LifeOS operating doctrine as Hermes-compatible skills and an optional native plugin. Its central idea is straightforward: give an agent explicit methods for understanding a current state, defining an ideal state, and closing the gap with evidence rather than improvisation.

The public package contains:

- **72 public Hermes-compatible skills** covering research, reasoning, security, writing, planning, creativity, system design, and personal operating workflows;
- a bootstrap installer at [`LifeOS/SKILL.md`](LifeOS/SKILL.md);
- an additive importer that preserves existing skills instead of overwriting them;
- an optional native `lifeos` plugin with explicit status, ISA, event-evidence, and public-profile tools; and
- a dry-run settings adapter for the small set of Hermes mappings that can be applied safely.

The repository name is **Life OS for Hermes**. Some internal paths and identifiers retain `LifeOS` or `HALOS` for compatibility with the source package and installer.

## Before installing

You need:

1. a working [Hermes Agent](https://hermes-agent.nousresearch.com/docs) installation;
2. [Bun](https://bun.sh) available on the machine;
3. an agent with terminal and filesystem access; and
4. a deliberate choice of which Hermes home/profile to modify.

The installer is consent-gated. Reading the installation skill does **not** authorize changes. The agent must show the dry-run first and ask separately before importing files, enabling the plugin, or applying settings.

## Install with an agent

### 1. Give the agent this URL

```text
https://github.com/AronAxe/lifeos-for-hermes/blob/fix/hermes-install-readiness/LifeOS/SKILL.md
```

This is the current verified public installation entrypoint. The agent must clone the complete repository branch because the installer, plugin, and skill library are stored beside `LifeOS/SKILL.md`.

### 2. Paste this instruction

```text
Install Life OS for Hermes from this public repository. Clone the complete
fix/hermes-install-readiness branch, then read and follow LifeOS/SKILL.md.
Identify the intended HERMES_HOME, show me the complete dry-run first, and
obtain my explicit consent before importing files, enabling the lifeos plugin,
or applying any settings. Verify every approved change when finished.
```

### 3. Review each decision

A correct agent-led installation proceeds in this order:

1. verify Hermes, Bun, the complete checkout, and the selected `HERMES_HOME`;
2. run the importer in dry-run mode;
3. show the target, planned skills and plugin, identical entries, and collisions;
4. ask whether to perform the import;
5. ask separately whether to enable the trusted native plugin;
6. inspect settings through the dry-run adapter and ask separately before applying any supported mapping; and
7. verify the installed skills, plugin decision, configuration state, and unresolved limitations.

A vague “continue” is not approval for an unreviewed side effect.

## Manual installation

The agent-led route is recommended because it enforces the decision boundaries. If you prefer to operate the commands yourself, clone the verified branch:

```bash
git clone --branch fix/hermes-install-readiness --single-branch \
  https://github.com/AronAxe/lifeos-for-hermes.git
cd lifeos-for-hermes
```

Determine the Hermes profile you intend to modify:

```bash
hermes config path
hermes --version
bun --version
```

Set `<selected-hermes-home>` to the approved Hermes home for that profile. Preview the import without writing anything:

```bash
HERMES_HOME="<selected-hermes-home>" \
  bun LifeOS/Tools/ImportSkills.ts --dry-run
```

Read the complete report. Only after approving that exact plan, apply it:

```bash
HERMES_HOME="<selected-hermes-home>" \
  bun LifeOS/Tools/ImportSkills.ts
```

The importer is additive. It does not overwrite a differing skill. Conflicts are preserved under a distinct `lifeos-*` name for review.

### Optional native plugin

The imported `lifeos` plugin is executable code and remains disabled until you choose to enable it:

```bash
HERMES_HOME="<selected-hermes-home>" hermes plugins enable lifeos
HERMES_HOME="<selected-hermes-home>" hermes plugins list --enabled
HERMES_HOME="<selected-hermes-home>" hermes lifeos status
```

If you do not enable the plugin, the public skills still install; plugin-dependent tools and commands remain unavailable by design.

### Optional settings classification

The settings adapter is dry-run by default:

```bash
HERMES_HOME="<selected-hermes-home>" \
  bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts \
  --hermes-home "<selected-hermes-home>" --dry-run
```

It may propose only the mappings it explicitly supports. It does not migrate secrets, provider choices, permissions, hooks, arbitrary environment variables, or unrelated Hermes settings. Applying the reviewed operations with `--apply` is a separate decision.

For the complete manual contract, read [`LifeOS/INSTALL.md`](LifeOS/INSTALL.md).

## What installation changes

With approval, the importer can add:

- public skills under `<HERMES_HOME>/skills/`; and
- the disabled native plugin payload under `<HERMES_HOME>/plugins/lifeos/`.

It does **not** automatically:

- activate the plugin;
- change the active model or provider;
- import credentials or secrets;
- create identity, TELOS, memory, or personal records;
- retain conversation transcripts or tool arguments;
- schedule recurring work or background services;
- publish anything externally;
- overwrite differing local skills; or
- delete an existing installation.

TELOS onboarding, Hindsight memory use, plugin activation, settings changes, scheduling, and removal are all separate consent-bound operations.

## Verify the installation

After the approved import, verify the selected target rather than assuming copied files are usable:

```bash
HERMES_HOME="<selected-hermes-home>" hermes skills list --source local
HERMES_HOME="<selected-hermes-home>" hermes plugins list --enabled
HERMES_HOME="<selected-hermes-home>" hermes config check
```

If the plugin was enabled, also run:

```bash
HERMES_HOME="<selected-hermes-home>" hermes lifeos status
```

In an already-running interactive Hermes session, use `/reload-skills` to rescan imported skills. A new session loads them normally.

## Updating

Update the checkout, then repeat the same dry-run-first process:

```bash
git pull --ff-only
HERMES_HOME="<selected-hermes-home>" \
  bun LifeOS/Tools/ImportSkills.ts --dry-run
```

Review the plan before applying it. Updates remain additive and collision-preserving; they are not blanket overwrites.

## Removal

There is intentionally no broad one-command uninstaller. Skills, the optional plugin, settings, TELOS sources, and any external memory belong to different ownership boundaries. Inventory them separately and obtain an explicit deletion decision for each target. Never remove the entire Hermes home to uninstall this package.

## Capability boundaries

This port preserves public LifeOS skills through Hermes-native mechanisms, portable resources, documented optional adapters, or explicit limitations. It does not claim automatic constitution injection, hidden identity seeding, historical runtime parity, autonomous scheduling, or implicit memory ingestion.

The authoritative implementation ledger is [`PORT_SCHEMAS/hook_mapping.md`](PORT_SCHEMAS/hook_mapping.md). Portable reference doctrine is included in [`LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md`](LifeOS/install/LIFEOS/HERMES_CONSTITUTION.md), but it is not silently injected as a system prompt or retained memory.

## Repository verification

Maintainers can run the complete repository gate with:

```bash
bun run verify
```

The gate runs the portability scan, Bun test suite, and Python test suite. Public release work should also inspect the full diff and perform an isolated scratch import before merging or publishing a release.

## Project layout

```text
LifeOS/SKILL.md                 Agent installation entrypoint
LifeOS/INSTALL.md               Canonical public installation guide
LifeOS/Tools/ImportSkills.ts    Additive skill and plugin importer
LifeOS/install/skills/          Public LifeOS skill packages
LifeOS/install/plugins/lifeos/  Optional native Hermes plugin
PORT_SCHEMAS/                   Portability and capability ledgers
tests/                          Installer, portability, and runtime tests
```

## Upstream and attribution

Life OS for Hermes is a Hermes-specific port of the public [LifeOS project](https://github.com/danielmiessler/LifeOS) created by [Daniel Miessler](https://danielmiessler.com) and its contributors. This port retains upstream attribution and adapts the public material to Hermes rather than presenting upstream Claude-specific machinery as supported functionality.

## Contributing

Issues and pull requests are welcome. Please keep changes portable, avoid personal data and credentials, preserve consent boundaries, and include evidence from the relevant tests. For installer or runtime changes, run `bun run verify` and document the isolated installation result.

## License

MIT License. See [`LICENSE`](LICENSE).

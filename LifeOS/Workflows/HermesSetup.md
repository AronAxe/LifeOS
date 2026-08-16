# Hermes setup — repository entry point

This file is a compatibility entry point for the former `HermesSetup` workflow. The supported HALOS installation procedure is now maintained in [`../INSTALL.md`](../INSTALL.md).

## What the supported setup does

1. Select the target `HERMES_HOME` without modifying it.
2. Run `bun LifeOS/Tools/ImportSkills.ts --dry-run` from the repository root.
3. Show the import plan and collision report; wait for explicit approval.
4. Run `bun LifeOS/Tools/ImportSkills.ts` only after approval.
5. If the principal wants the native plugin, enable it explicitly with `hermes plugins enable lifeos` and verify with `hermes plugins list --enabled`.
6. Verify imported skills with `hermes skills list --source local`; use `/reload-skills` only in an already active interactive session.
7. Run the deployed settings adapter in dry-run mode, review its classifications, and obtain separate consent before any `--apply` operation.

## What it does not do

This workflow does not create a config tree, write a global constitution, install project context automatically, link a TELOS directory, seed Hindsight, create scheduled work, or probe/modify unrelated services.

A principal may later choose to create a project-local `HERMES.md` or `.hermes.md` under Hermes’s normal project-context rules. That is an independent, reviewed project change—not an installation side effect.

The legacy Claude/Pulse installer functions are not alternatives. They are unsupported upstream mechanisms.

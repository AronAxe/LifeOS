# Uninstall — review boundary

No public automated HALOS uninstaller is implemented. Do not present this document as a deletion command, a manifest-driven cleaner, or a guarantee that locally imported files can be removed safely.

## Before any removal

1. Establish the selected `HERMES_HOME` without changing it.
2. Inventory separately:
   - imported `lifeos-*` skill directories and the `lifeos` plugin, if present;
   - principal-owned TELOS sources, Hindsight records, documents, and other data;
   - the original release/source checkout.
3. Show the inventory and ask what the principal actually wants removed, retained, or archived. Default to retaining all principal-owned data and the source release.
4. Confirm that no maintainer/source tree is being targeted.

## Removal decision

Use documented Hermes plugin and skill management only after the principal makes an explicit decision. Do not claim that a Hermes command removes a locally imported payload unless that command and its target have been verified for this installation.

Do **not** delete broad `HERMES_HOME` directories, shared skill directories, configuration files, or Hindsight data. Never remove source material, TELOS, or any user-authored record as part of plugin/skill removal. Data deletion is a separate, explicit decision with its own reviewed target list.

## Report

After an approved and verified removal, report exactly what changed, what was retained, and any item that could not be safely classified. If there is uncertainty about ownership or effect, stop rather than guessing.

## Capability boundary

Legacy hook removal, `settings.json` restoration, Claude launch cleanup, Pulse shutdown, user-tree/symlink deletion, and manifest-keyed file removal are not Hermes adapters and must not be invoked through this workflow. The absence of an automated uninstaller is an explicit current limitation, not permission to improvise one.

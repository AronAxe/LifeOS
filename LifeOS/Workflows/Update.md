# Update — HALOS on Hermes

Brings an existing HALOS install up to the current version without touching the user's data.

## Update Flow

### 1. Dry-Run Import
Run `ImportSkills` in dry-run mode to check for changes and collisions:
```bash
bun LifeOS/Tools/ImportSkills.ts --dry-run
```
### 2. Resolve Collisions
Resolve any collisions manually. Do not overwrite destructively.

### 3. Non-Destructive Apply
Apply the import non-destructively:
```bash
bun LifeOS/Tools/ImportSkills.ts
```

### 4. Optional Plugin Status
If the native plugin is enabled, verify it with:
```bash
hermes plugins list --enabled
hermes lifeos status
```

### 5. Settings Reclassification
Run the deployed settings adapter to view its classifications:
```bash
bun LifeOS/install/skills/LifeOS/Tools/InstallSettings.ts --hermes-home <selected-dir> --dry-run
```
Apply only the reviewed, verified operations with explicit principal consent.

## Boundaries & Limitations
- **Do not claim hooks/imports/launch aliases.** The old legacy integrations are not part of the Hermes update flow.
- Ensure the TELOS source remains a principal-supplied configured path.
- Treat lifecycle plugin hooks as passive operational evidence. No automatic phase advancing.
- Update is additive and non-destructive. Never removes user customizations or overwrites user data.

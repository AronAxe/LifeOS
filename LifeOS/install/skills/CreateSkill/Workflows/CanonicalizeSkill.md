# Canonicalize Skill Workflow

Canonicalization normalizes an inherited skill without silently narrowing its user-visible capability.

## 1. Inventory before editing

Read the complete skill and every linked resource. Build a capability ledger:

| Capability | Trigger | Implementation/evidence | Dependency | Side effect | Current status |
|---|---|---|---|---|---|
| ... | ... | command, script, tool, or workflow | native/optional/legacy | read/write/external | works/partial/unsupported |

Include outputs, error handling, schemas, verification, and lifecycle behavior—not only headings.

## 2. Classify inherited machinery

For each mechanism choose exactly one:

- **preserve:** portable behavior already works;
- **replace:** map it to a real Hermes-native tool or shipped script;
- **adapt:** retain it through an explicit, configured optional adapter;
- **retire:** remove unsupported harness machinery while documenting the bounded limitation.

Voice hooks, guessed home directories, private services, hidden agent types, fabricated logs, and unavailable global tools may be retired. Domain algorithms, output schemas, actor behavior, update safeguards, and verification procedures are not runtime-specific and should be preserved.

## 3. Normalize structure

- valid YAML frontmatter and unique lowercase name;
- trigger-first description with clear exclusions;
- concise scope, prerequisites, procedure, safety, and verification;
- linked resources only under supported `references/`, `templates/`, `scripts/`, or `assets/` for local skills, or repository-governed equivalents;
- no dangling file/command references;
- no unnecessary nesting or duplicate routing sections.

Do not rename public skill identifiers, commands, or resource paths without checking consumers and migration impact.

## 4. Implement reversibly

Use narrow patches where possible. Preserve source-control or skill-manager recovery. For each replaced capability, add its real command/configuration and a decisive failure mode; prose alone does not implement an adapter.

## 5. Compare after editing

Rebuild the capability ledger and label every row:

```text
preserved | Hermes replacement | optional adapter | intentionally unsupported
```

Any missing row is a blocker until restored or explicitly justified. Run the pre-existing happy paths where available, new adapter/failure tests, portability checks, link validation, and the full repository gate.

## 6. Completion report

Return changed files, capability mapping, tests/evidence, intentional retirements, migration notes, and untested surfaces. Canonicalization is complete only when the resulting skill is loadable and its retained capabilities still execute.

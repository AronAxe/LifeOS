# Validate Skill Workflow

Validate the actual installed or repository artifact, not a remembered version.

## 1. Resolve scope

Load the complete `SKILL.md`, linked resources, neighboring skill descriptions, and repository governance. Confirm whether the target is a local Hermes skill, a source-controlled release skill, or another profile. Do not mutate during validation.

## 2. Structural checks

- parseable YAML frontmatter;
- unique lowercase name and trigger-first description;
- linked resources exist in supported locations;
- no ambiguous duplicate skill paths;
- every routed workflow/tool exists;
- scripts declare prerequisites and fail clearly.

## 3. Routing checks

Create representative should-trigger and should-not-trigger prompts. Check collisions with nearby skills, implicit valid intents, shared-keyword near misses, and explicit negative triggers. Runtime routing trials are preferable when isolated; otherwise label the result as static review.

## 4. Portability checks

Scan for credentials, personal identifiers, absolute user paths, retired harness roots, local-only ports, private services, provider assumptions, undeclared packages, and source-only resources. Placeholders must have a documented resolution path.

## 5. Capability-honesty checks

Inventory every named command, tool, file, route, plugin event, config key, output schema, and automated behavior. Verify whether it is native, shipped, optional, manual, or unsupported. Documentation is not enforcement; an executable claim needs code/configuration and a testable path.

## 6. Safety checks

Review write/publication/deletion approvals, external data transfer, paid calls, profile isolation, secret handling, input validation, rollback, and end-to-end verification. Confirm failure behavior is fail-closed where sensitive data or external side effects are involved.

## 7. Execution checks

Run syntax checks and focused tests for scripts. Exercise at least one representative happy path and one decisive failure/refusal path in an isolated target when possible. Read back artifacts and query destinations instead of trusting exit status alone.

## 8. Report

Use this result shape:

```text
Skill validation: <name>
Verdict: PASS | PASS WITH LIMITATIONS | FAIL

Structure:       pass/fail — evidence
Routing:         pass/partial/fail — evidence
Portability:     pass/fail — evidence
Capability:      pass/partial/fail — evidence
Safety:          pass/fail — evidence
Execution:       pass/partial/fail — evidence

Findings:
- P0/P1/P2 — file:section — problem — required repair
Untested surfaces:
- ...
```

A clean Markdown parse is not proof that the skill works. Any fabricated capability, secret exposure, uncontrolled side effect, or missing decisive verification is a failure.

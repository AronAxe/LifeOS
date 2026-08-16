# Test Skill Workflow

Test the skill's stated contract, not merely its Markdown syntax.

## 1. Inventory the contract

Read the installed/repository skill and linked resources. Enumerate:

- trigger and negative-trigger boundary;
- workflows and expected outcomes;
- required tools, commands, inputs, and optional dependencies;
- writes, external calls, approvals, and refusal behavior;
- artifacts and decisive completion evidence.

## 2. Build representative cases

Include at minimum:

1. one normal happy path;
2. one edge case;
3. one missing-prerequisite or malformed-input case;
4. one prohibited/approval-gated action;
5. one routing near-miss when the skill has a confusable neighbor.

For artifact-producing skills, define a rubric before execution: correctness, completeness, provenance, portability, safety, and recoverability.

## 3. Execute in isolation

Use temporary inputs, a scratch target, or a dry-run mode whenever possible. Exercise linked scripts with their documented commands and capture exit status, stdout/stderr, and created paths. Never test publication, deletion, financial actions, live credentials, or another profile without explicit authorization.

When meaningful and feasible, compare:

- **with skill:** the documented workflow and resources;
- **baseline:** the same bounded task without relying on the skill's specialized procedure.

Use the same input and rubric. A baseline comparison is optional when it would be unsafe, costly, or impossible to isolate.

## 4. Verify outputs

Read generated files, query destinations, inspect representative records, and confirm counts/checksums where material. Verify optional dependencies fail with actionable guidance. A successful process exit is not sufficient when the destination can be checked.

## 5. Report and iterate

For each case record:

```text
Case: <id and intent>
Expected: <observable result>
Observed: <tool-backed result>
Evidence: <command, path, URL, or ID>
Verdict: pass | fail | partial | untested
Gap: <cause and smallest repair>
```

Separate implementation failures from documentation failures and environment limitations. Repair through the Update/Canonicalize workflow, rerun the failed cases, then run the repository's full gate where applicable. Report remaining untested surfaces explicitly.

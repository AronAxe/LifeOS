# Create Skill Workflow

## 1. Discover

Use `skills_list` and `skill_view` to inspect related skills, naming conventions, and possible collisions. Search the target repository when the skill is source-controlled. Do not create a duplicate merely because capitalization differs.

## 2. Define the contract

Write down the trigger, user-visible outcome, required tools, side effects, prerequisites, safety boundaries, linked resources, and decisive verification. Decide whether the skill belongs locally or in a repository release.

## 3. Draft

Prepare complete `SKILL.md` content with portable frontmatter and concise procedural sections. Keep the trigger self-contained near the beginning of the description. Put reusable code in a linked script rather than embedding long ad-hoc shell sequences.

Before implementation, perform a sufficiency check for substantive artifact-producing skills: confirm the skill contains enough domain method, output structure, examples/templates where necessary, and verification criteria to improve on generic agent behavior. Brevity is not a substitute for capability.

For workflows backed by a CLI or script, document the complete intent-to-interface mapping: required inputs, flags/configuration, model or mode selection, output options, exit codes, side effects, and verification. A workflow that names a tool without showing how user intent reaches its interface is incomplete.

## 4. Review portability and honesty

Reject principal names, credentials, absolute user paths, private infrastructure, stale harness directories, and commands that are not installed. Distinguish native, optional, manual, and unsupported behavior.

## 5. Create

For a local Hermes skill use:

```text
skill_manage(action="create", name="lowercase-skill-name", content="<complete SKILL.md>", category="<optional-category>")
```

For a source-controlled skill, use the repository's governed authoring workflow and tests. Do not mutate another profile or publish without authorization.

## 6. Add linked resources

Use `skill_manage(action="write_file", ...)` for supported linked paths. Scripts must validate inputs, fail clearly, avoid embedded secrets, and produce deterministic/auditable output where possible.

## 7. Verify

View the finished skill, inspect linked files, run applicable scripts or tests, and verify that the trigger and procedure match the requested behavior. Reload skills in an already-running session when needed.

## 8. Report

Report the exact skill name/path, resources created, tests actually run, limitations, and whether reload is required. Do not claim success from a write call alone when executable behavior was requested.

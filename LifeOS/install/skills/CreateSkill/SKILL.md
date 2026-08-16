---
name: create-skill
version: 2.0.0
category: LifeOS
portable: true
description: >
  Use for any Hermes skill creation, update, validation, or canonicalization.
  Requires discovery first, explicit scope, skill_manage mutations, and verified
  reload/read-back; never hand-rolls hidden harness directories.
---

# CreateSkill — Hermes Skill Orchestrator

## Mandatory route

Use this skill whenever the requested work creates, updates, reorganizes, or validates a Hermes skill. Do not write directly into a guessed skills directory.

1. List or view related skills first.
2. Determine whether the target is a local Hermes skill, an in-repository release skill, or another profile's skill.
3. Inspect collisions, consumers, cron references, plugins, and linked files before mutation.
4. Use `skill_manage` for local skill creation and maintenance.
5. Use the repository's governed authoring process for source-controlled release skills.
6. Validate, read back, and reload skills when the active session must see the result.

## Workflows

- `Workflows/CreateSkill.md` — create a new skill
- `Workflows/UpdateSkill.md` — patch or revise an existing skill
- `Workflows/ImproveSkill.md` — diagnose feedback and iteratively improve an existing skill
- `Workflows/ValidateSkill.md` — structural, portability, and behavioral validation
- `Workflows/CanonicalizeSkill.md` — normalize an inherited skill without capability loss
- `Workflows/OptimizeDescription.md` — improve the trigger description
- `Workflows/TestSkill.md` — exercise the skill and linked resources

## Skill contract

A portable skill needs:

- YAML frontmatter with a unique lowercase name and a self-contained trigger description;
- explicit scope, prerequisites, procedure, safety boundaries, and verification;
- real Hermes tools and documented commands only;
- linked resources under `references/`, `templates/`, `scripts/`, or `assets/`;
- no credentials, principal identity, private paths, unsupported runtime roots, or invented automation;
- no claim that documentation is enforcement unless code implements it.

## Mutation policy

- `skill_manage(action="create")` for a new local skill.
- `skill_manage(action="patch")` for narrow corrections.
- `skill_manage(action="edit")` only after reading the complete skill and only for a deliberate full rewrite.
- `skill_manage(action="write_file")` for governed linked resources.
- `skill_manage(action="delete")` only with explicit intent and an `absorbed_into` decision.

Other profiles are separate control planes. Do not edit them without explicit direction.

## Completion standard

The work is not complete until the skill can be viewed, its metadata and links resolve, applicable commands/scripts have been exercised, and the active session has been told to reload when necessary. Report actual evidence, not planned tests.

# Getting Started — after the HALOS import

HALOS installs public LifeOS doctrine as Hermes skills. The importer is additive: it does not activate plugins, migrate secrets, create a principal corpus, schedule jobs, or apply settings without a separate explicit decision.

## 1. Confirm the import report

The importer report is the installation receipt. A complete public import reports 72 public skills and the native `lifeos` plugin payload, with private `_ALLCAPS` skills excluded. Conflicts are reported and never overwritten silently.

If you have not applied the import yet, use the dry run first:

```bash
bun LifeOS/Tools/ImportSkills.ts --dry-run
```

Apply only after reviewing the destination and collision report:

```bash
bun LifeOS/Tools/ImportSkills.ts
```

After an import or update, reload skills in the current Hermes client or begin a new session before testing changed guidance.

## 2. Keep mutable data outside installed skills

Installed skill directories are read-only packages. They are not workspaces and must not hold preferences, browser profiles, story projects, evaluation results, or other mutable principal data.

Skills that support reusable customizations refer to `<LIFEOS_WORKSPACE>/skills/<skill-name>/`. Set `LIFEOS_WORKSPACE` only to an explicitly approved writable directory. Domain-specific tools may use a narrower variable, such as `LIFEOS_EVALS_WORKSPACE` or `LIFEOS_WRITING_WORKSPACE`; their skill documentation is authoritative.

A missing workspace is not permission to invent one. Tools and workflows must remain read-only or ask for a destination before writing.

## 3. Treat optional capabilities honestly

There is no global LifeOS Doctor, capability manifest, hidden daemon, or automatic degradation registry on Hermes. Each skill declares its own prerequisites and must fail visibly when an optional dependency is absent.

Use Hermes-native tools where available:

- web retrieval through the configured Hermes web and browser tools;
- inference through the consent-gated Hermes inference adapter;
- speech through the configured Hermes text-to-speech tool;
- delegation through Hermes subagents;
- scheduled work only through an explicitly created Hermes cron job.

Provider credentials, external CLIs, paid scraping, browser profiles, and publishing adapters remain optional and separately consent-gated. Credential presence never implies spending or publication approval.

## 4. Activate the native plugin separately

Importing the `lifeos` plugin payload does not enable it. Review `INSTALL.md` and `PORT_SCHEMAS/hook_mapping.md`, then make plugin activation as a separate explicit decision.

The plugin supplies bounded ISA state, event evidence, public-profile preview, status, lifecycle hooks, commands, SQLite state, and dashboard support. It does not inject the constitution or identity automatically, retain transcript text, advance phases, create schedules, or recreate the retired Claude/Pulse runtime.

## 5. Verify the capability you intend to use

Test the actual path end to end rather than relying on installation presence. For example:

- render a scratch ISA through the installed ISA renderer;
- run an evaluation with a stub or explicitly approved Hermes inference command;
- execute a web retrieval and retain source receipts;
- preview a daemon/public-profile update without publishing it;
- confirm an optional adapter fails closed when its configuration is absent.

That is the operating contract: explicit sources, explicit consent, visible degradation, and evidence from the real execution path.

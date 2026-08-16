# PreviewDaemon Workflow

**Purpose:** Produce and review the exact candidate public-profile update without writing or publishing anything.

## Process

1. Confirm `LIFEOS_DIR` and the explicit public mission, goal, project, and section selections.
2. Inventory source availability:

```bash
bun $HERMES_HOME/skills/daemon/Tools/DaemonAggregator.ts --sources
```

3. If a current artifact exists, compare against it:

```bash
bun $HERMES_HOME/skills/daemon/Tools/DaemonAggregator.ts --diff <current-daemon.md>
```

Otherwise render a read-only preview:

```bash
bun $HERMES_HOME/skills/daemon/Tools/DaemonAggregator.ts --preview --verbose
```

4. Report sections added, removed, unchanged, missing sources, and every security redaction.
5. Flag any selected content that appears identity-specific, stale, financial, medical, location-sensitive, credential-bearing, or otherwise unsuitable for publication.

Do not write, invoke the publisher adapter, or infer public selections during this workflow.

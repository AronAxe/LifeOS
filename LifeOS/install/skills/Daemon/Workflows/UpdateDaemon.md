# UpdateDaemon Workflow

**Purpose:** Aggregate explicitly approved source material, review the candidate, then write a local daemon artifact after approval. Publication is separate.

## Process

1. Run the complete `PreviewDaemon` workflow.
2. Present a concise section-by-section diff, missing-source warnings, and security redactions.
3. Obtain explicit approval for the exact local output path and candidate content.
4. Write the artifact:

```bash
bun $HERMES_HOME/skills/daemon/Tools/DaemonAggregator.ts --output <approved-daemon.md>
```

5. Read the written file back. Confirm its byte count, expected sections, and absence of prohibited names, private paths, credentials, or unapproved source material.
6. Stop. A local update does not authorize publication.

If the principal also requests publication, continue with `DeployDaemon.md` as a separate consent gate.

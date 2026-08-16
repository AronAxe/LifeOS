# DeployDaemon Workflow

**Purpose:** Publish an already reviewed daemon artifact through an explicitly configured external adapter. This workflow does not aggregate or alter content.

## Preconditions

- The input file exists and has been read back after generation.
- `LIFEOS_DAEMON_PUBLISH_ADAPTER` is an absolute executable path.
- Optional fixed arguments are a JSON array in `LIFEOS_DAEMON_PUBLISH_ADAPTER_ARGS`.
- The user has approved the adapter, destination, input file, and expected external side effects.

## Process

1. Exercise the adapter's dry-run contract when supported:

```bash
bun $HERMES_HOME/skills/daemon/Tools/PublishAdapter.ts --input <approved-daemon.md> --dry-run
```

2. Show the resolved adapter, input, destination reported by the adapter, and planned side effects.
3. Obtain explicit publication approval.
4. Publish:

```bash
bun $HERMES_HOME/skills/daemon/Tools/PublishAdapter.ts --input <approved-daemon.md>
```

5. Treat exit code zero as adapter completion, not destination verification. Verify the returned URL, artifact ID, repository revision, or remote checksum using the appropriate external tool.

If no adapter is configured, publication is unavailable. Do not substitute `git push`, create hosting, or invent an endpoint.

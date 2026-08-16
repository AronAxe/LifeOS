# ReadDaemon Workflow

**Purpose:** Inspect the current local public-profile artifact and, when configured, compare it with a live destination.

## Process

1. Inventory current source availability without writing:

```bash
bun $HERMES_HOME/skills/daemon/Tools/DaemonAggregator.ts --sources
```

2. Read the configured local daemon artifact directly. Report its sections, item counts, last-updated field, and any missing or malformed sections.
3. If `LIFEOS_DAEMON_STATUS_URL` is configured, fetch that exact URL with the web tool and compare its observable content or checksum with the local artifact.
4. Report local state and live state separately. If no live URL is configured, say that remote status is unavailable.

Do not assume a domain, MCP endpoint, hosting provider, repository, or deployment topology.

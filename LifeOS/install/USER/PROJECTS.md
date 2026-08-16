---
provenance: template
last_updated: 1970-01-01T00:00:00Z
last_updated_by: bootstrap-template
convention: pai-freshness-v1
---

# Projects

> Upstream bootstrap scaffold retained for reference; HALOS does not deploy or auto-load this file.
>
> Do not store real project data here during a HALOS install. Use the principal-approved Hermes workspace, configured TELOS, or memory destination.

Upstream LifeOS used this table at startup to route aliases. HALOS installs no reader or startup import for it.

## Projects Table

| Project | Path | URL | Deploy | Stack |
|---------|------|-----|--------|-------|
| (interview — first project) | `~/code/example` | example.com | `bun run deploy` | TS, React |

## Routing Aliases

When you say... | The DA routes to...
---|---
"my site", "the blog" | (interview — primary site)
"the workspace", "that project" | (interview — main active project)

---
*Interview asks about your active projects one at a time and appends rows to the table. Aliases help the DA route natural language ("check the blog deploy") to the right codebase. Keep this current — it's cheap to maintain incrementally, expensive to reconstruct.*

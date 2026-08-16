# Build TELOS Dashboard Workflow

Use this workflow to instantiate the shipped dashboard without inventing a personal source path, model provider, credential, or deployment target.

## 1. Confirm scope and privacy

Obtain the principal-supplied TELOS directory, approved output directory, audience, classification, and intended exposure. Treat personal TELOS as sensitive. A public/networked deployment requires a separate authentication and security review.

## 2. Copy the portable template

Resolve the installed skill root as `<TELOS_SKILL_DIR>` and copy `<TELOS_SKILL_DIR>/DashboardTemplate/` to the approved output directory. Do not edit or run the template inside the installed skill directory.

## 3. Configure capabilities explicitly

Create `.env.local` from the template's `.env.example`:

- `TELOS_DIR` — required absolute path to the existing principal-supplied source;
- `TELOS_ALLOW_WRITES` — `false` by default; set `true` only after explicit approval;
- `TELOS_CHAT_ENDPOINT` — optional HTTP adapter;
- `TELOS_CHAT_INCLUDE_CONTEXT` — independent consent gate for sending TELOS context;
- `TELOS_CHAT_BEARER_TOKEN` — optional adapter credential, stored only in the local environment file.

Read/view, mutation, and context egress are separate capabilities. Enabling one does not authorize the others.

## 4. Customize without deleting capability

Replace presentation placeholders with evidence-backed project data while retaining, unless the principal narrows scope:

- overview and metrics;
- dynamic Markdown/CSV navigation and rendering;
- consent-gated upload/edit with rollback;
- project, progress, and vulnerability views;
- optional configured-assistant interface.

Do not replace executable behavior with prose or hard-code a provider merely to make a demonstration look complete.

## 5. Build and probe

After dependency-install approval:

1. run `bun install` in the copied project;
2. run `bun run build`;
3. start a bounded local server;
4. verify the unconfigured state is honest and read-only;
5. point `TELOS_DIR` at a disposable fixture corpus and verify inventory/rendering;
6. if writes were approved, verify upload, backup, edit, and traversal rejection against fixtures;
7. if chat was approved, verify the adapter request/response contract and context-egress gate;
8. stop the server.

## 6. Deliver

Return the output path, configuration decisions, build/smoke evidence, enabled capabilities, and limitations. Publishing, network exposure, and use of real personal TELOS remain separate approvals.

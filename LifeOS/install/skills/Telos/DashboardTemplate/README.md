# TELOS Dashboard Template

A portable Next.js dashboard for a principal-configured TELOS corpus. It retains the upstream overview, file navigation, Markdown/CSV rendering, upload/edit interface, project/progress pages, and optional question interface without assuming a personal filesystem, Claude runtime, model provider, or bundled credential.

## Capability and consent boundaries

- **Read/view:** enabled when `TELOS_DIR` is an absolute path to an existing directory.
- **Upload/edit:** disabled by default. Set `TELOS_ALLOW_WRITES=true` only after approving dashboard mutations. Existing-file edits create a sibling `.bak` before an atomic replacement.
- **Ask:** disabled by default. It requires an explicitly configured HTTP adapter and separate consent to send TELOS context to it.
- No source directory, account, API key, deployment, server, or background refresh is created automatically.

## Configure

Copy this template into an approved project directory, then create `.env.local` from `.env.example`:

```bash
cp -R <TELOS_SKILL_DIR>/DashboardTemplate ./telos-dashboard
cd ./telos-dashboard
cp .env.example .env.local
```

Set an absolute source path:

```dotenv
TELOS_DIR=C:/<your-path>/TELOS
TELOS_ALLOW_WRITES=false
TELOS_CHAT_ENDPOINT=
TELOS_CHAT_INCLUDE_CONTEXT=false
TELOS_CHAT_BEARER_TOKEN=
```

On POSIX hosts, use a normal absolute path such as `/home/<you>/TELOS`. `TELOS_DIR` is the source of truth; the template does not copy the corpus into the installed skill.

## Install and verify

```bash
bun install
bun run build
bun dev
```

Open the local address printed by Next.js. Dependency installation, server startup, network exposure, and deployment remain explicit operator actions.

## File behavior

The dashboard enumerates regular, non-symlinked files only:

- Markdown files directly under `TELOS_DIR`;
- CSV files under `TELOS_DIR/data`.

Uploads accept simple `.md` and `.csv` filenames up to 5 MiB. Uploads never overwrite. Edits accept only files returned by the dashboard inventory, reject traversal/symlinks, retain the prior content as `<filename>.bak`, and replace atomically. If an existing regular `updates.md` is present, mutations append a concise receipt; the template does not invent a logging convention otherwise.

## Optional chat adapter

Set both:

```dotenv
TELOS_CHAT_ENDPOINT=https://your-approved-adapter.example/chat
TELOS_CHAT_INCLUDE_CONTEXT=true
```

The dashboard sends a JSON POST:

```json
{
  "message": "the user's question",
  "context": "the configured TELOS Markdown/CSV context",
  "instructions": "answering and citation guidance"
}
```

The adapter must return:

```json
{ "response": "answer text" }
```

If the adapter requires bearer authentication, set `TELOS_CHAT_BEARER_TOKEN` in `.env.local`. Context inclusion is a deliberate egress gate because TELOS may contain sensitive identity and health material. Prefer a local or otherwise approved adapter; never expose this dashboard publicly without authentication and a separate security review.

## Pages retained

- `/` — overview and metric cards to customize;
- `/ask` — optional configured-assistant chat;
- `/add-file` — consent-gated Markdown/CSV upload;
- `/file/[slug]` — file rendering and consent-gated editing;
- `/projects`, `/progress`, `/vulnerabilities` — project-specific template pages.

The template intentionally includes placeholders in project-specific presentation pages. Replace them with evidence-backed project data before delivery, then inspect representative pages and run the real build.

## Stack

Next.js 15, React 19, TypeScript, Tailwind CSS 4, shadcn-style components, Lucide icons, and Bun. The template is provider-neutral and has no direct model SDK dependency.

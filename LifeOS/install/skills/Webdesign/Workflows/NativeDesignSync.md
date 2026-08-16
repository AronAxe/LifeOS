# NativeDesignSync — optional external adapter

This workflow documents interoperability with a separately managed Claude Design/Claude Code installation. It is not a HALOS runtime path, is never selected by default, and must not be invoked unless the user explicitly requests it and confirms its prerequisites.

## Trigger Phrases

"/design", "/design-sync", "design sync", "sync design system", "pull design system into Claude Design", "push code back to Claude Design", "native design command"

## What These Commands Are

Anthropic shipped both commands inside Claude Code in the June 2026 Claude Design update. GA on Pro, Max, Team, and Enterprise at no extra cost. Official reference: `support.claude.com/en/articles/14604416-get-started-with-claude-design`.

| Command | What it does |
|---------|-------------|
| **`/design`** | Create, edit, and sync designs from inside the Claude Code terminal — no switch to the web app or desktop sidebar. |
| **`/design-sync`** | Bidirectional sync between the codebase and Claude Design. **Pull:** import the local codebase's real design system into Claude Design so generated designs use your actual components and tokens. **Push:** sync implemented code changes back into Claude Design so the canvas stays current. |

## Why This Adapter Can Be Useful for Code Work

When the separately managed commands are genuinely available, they can replace much of the older Path 3 bundle apparatus (`ExtractDesignSystem` → `CreatePrototype` → `ExportToCode` → `IntegrateIntoApp`) for a deliberate canvas round-trip. That convenience does not make this the default: DirectDesign remains the Hermes-native route, and this adapter is used only after explicit selection and preflight.

## Workflow

### 1. Preflight

Only after explicit user selection, verify that the independently managed adapter exists:

```bash
claude --version
```

HALOS does not install, authenticate, or update this command. If it is absent or the required product commands are unavailable, report the optional adapter as unavailable and return to the Hermes-native DirectDesign path only with the user's agreement.

### 2. Pull the codebase design system into Claude Design

From inside the target repo, run `/design-sync` and choose the pull direction. This reads the real components and tokens from code (the native-first bet — no `.fig`, no Figma coupling) and primes Claude Design with them, so subsequent designs match what ships. This is the native equivalent of the old `ExtractDesignSystem` workflow.

### 3. Create or edit the design

Use `/design` to drive design work from the terminal, or open the design on the web canvas / desktop sidebar for visual review — the synced design system carries across surfaces.

### 4. Push built changes back

After implementing in code, run `/design-sync` in the push direction to update the Claude Design canvas, keeping design and code in lockstep.

### 5. Verify

Native sync does not exempt the output from verification. Render the result with an available Hermes computer/browser capability, inspect a real capture, and run the relevant project tests before claiming completion. If the user separately approves an external verification adapter, `Tools/VerifyDesign.ts` may be used after its own prerequisites pass.

## When NOT to use this

- **Pure inline/ad-hoc design with no canvas round-trip** → use Path 1 (`DirectDesign`). Faster, no subscription dependency.
- **You specifically need the visual web canvas and accept the setup cost** → Path 3 (`CreatePrototype` et al.), after explicitly selecting an approved authenticated browser profile.

## Adapter limits

- **This is a separately managed Claude Code integration, not a LifeOS skill or Hermes API.** There is no public Claude Design REST API or MCP server represented here.
- **Subscription-gated.** Missing access makes this adapter unavailable; it does not degrade the Hermes-native DirectDesign path.
- **No lifecycle management.** HALOS does not run external update commands or modify the external product's configuration.
- **Sync direction is explicit.** `/design-sync` is bidirectional; confirm pull versus push before any operation that may overwrite state.

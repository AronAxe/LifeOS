# ExportToCode

> **Optional external adapter.** This workflow applies only when the user explicitly selects the Claude Design web-canvas path and provides an approved authenticated browser profile. It is not preferred over DirectDesign or assumed available. See `SKILL.md` → Prerequisites.

Claude Design handoff bundle → production code via the `frontend-design` plugin.

## Trigger Phrases

"export to code", "ship to code", "send to Claude Code", "process handoff bundle", "turn this into a component"

## Inputs

Required — one of:
- **Active Claude Design session** with a prototype ready to export
- **Existing handoff bundle** — a directory previously exported from Claude Design

Optional:
- **Framework target** — overrides the bundle's default framework
- **Output directory** — where the generated code should land

## Workflow

### 1. Export from Claude Design (if not already done)

```bash
OUT=~/Downloads/webdesign/export/$(date +%Y%m%d-%H%M%S)
mkdir -p "$OUT"

bun "$HERMES_HOME/skills/webdesign/Tools/DriveClaudeDesign.ts" export bundle "$OUT/bundle"
```

The `bundle` format produces a directory containing:
- `PROMPT.md` — a structured handoff brief written by Claude Design
- `tokens.json` — design tokens (colors, typography, spacing)
- `components/` — component scaffolds (if applicable)
- `assets/` — images, fonts, icons
- `preview.html` — static reference render

### 2. Parse the Bundle

```bash
bun "$HERMES_HOME/skills/webdesign/Tools/ProcessHandoffBundle.ts" "$OUT/bundle" > "$OUT/bundle.json"
bun "$HERMES_HOME/skills/webdesign/Tools/ProcessHandoffBundle.ts" "$OUT/bundle" --brief > "$OUT/integration-brief.md"
```

The `--brief` flag emits a markdown summary suitable for a direct Hermes integration pass or, when independently installed and approved, an optional external frontend-design plugin.

### 3. Integrate the Bundle

The supported route is to integrate the bundle in Hermes against the target project's real framework, components, and tokens. If the user independently maintains and explicitly requests a compatible Claude Code `frontend-design` plugin, the same bundle and brief may instead be handed to that optional external product:

> "Build the frontend from this handoff bundle: $OUT/bundle. Follow the integration brief at $OUT/integration-brief.md. Target framework: $FRAMEWORK. Place output in $OUT/code/."

Do not assume the external plugin exists or activates. Whichever route is used must produce reviewable code in `$OUT/code/` before verification.

### 4. Verify the Generated Code

```bash
# Start a local preview (depends on framework)
cd "$OUT/code"
bun install
bun dev &
DEV_PID=$!
sleep 3

# Screenshot the running app
bun "$HERMES_HOME/skills/webdesign/Tools/VerifyDesign.ts" http://localhost:5173 "$OUT/verify"

kill $DEV_PID
```

Compare `$OUT/verify/screenshot.png` against `$OUT/bundle/preview.html` — fidelity should be within visual tolerance. Flag any regressions.

### 5. Accessibility Check

```bash
bun "$HERMES_HOME/skills/webdesign/Tools/VerifyDesign.ts" --a11y http://localhost:5173 "$OUT/a11y"
```

Any critical or serious a11y violations block shipping. Fix in code before proceeding.

### 6. Handoff to Next Step

- **Integrating into an existing app** → `Workflows/IntegrateIntoApp.md` with `$OUT/code` as source
- **Deploying standalone** → `Workflows/DeployDesign.md` with `$OUT/code` as source

## Framework-Specific Notes

| Framework | Bundle produces | Typical adjustments |
|-----------|----------------|---------------------|
| **React + Vite** | `src/` with components, `tailwind.config.ts`, `package.json` | Add routing, state mgmt if needed |
| **Next.js** | `app/` with pages, layouts, server components | Wire data-fetching, auth |
| **Astro** | `src/pages/`, `src/components/` with Astro + React islands | Set integrations in `astro.config.mjs` |
| **VitePress** | `.vitepress/theme/` overrides + custom layout components | Limited — static content only |
| **Vue** | `src/components/` Vue 3 composition API | Add Pinia/router if needed |
| **Vanilla HTML** | single `index.html` + `styles.css` + `script.js` | Easiest to drop into static hosts |

## Common Pitfalls

- **Skipping `ProcessHandoffBundle`** — reading the raw bundle into the frontend-design plugin works but loses the structured brief. Always generate the brief first.
- **Framework mismatch** — if the bundle was exported for React and you feed it to an Astro project, results drift. Re-export with the right framework or use `IntegrateIntoApp` for translation.
- **Trusting preview.html as production** — `preview.html` is a static one-off render. It is NOT production code. Always run the actual framework build.
- **No verification** — exported code that "should work" often has subtle issues (missing deps, broken imports, a11y regressions). Verify before handing downstream.

## Time Estimate

2-5 minutes for bundle parse + plugin handoff. Add 2-10 minutes for verification and a11y pass.

---
name: Webdesign
version: 1.2.0
description: "Design and integrate web interfaces through Hermes-native DirectDesign, with optional explicitly selected Claude Design adapters for users who independently provide those external products. USE WHEN web design, UI design, create prototype, design system, redesign site, mockup, landing page, dashboard design, design-to-code, frontend design, polish UI, design audit, brutalist/editorial/retro UI. DirectDesign is the default and requires no Claude runtime. NOT FOR illustrations/logos (use Art) or video (use Remotion)."
license: Complete terms in LICENSE.txt
effort: medium
---

## What It Does

Designs and integrates web interfaces through a self-contained Hermes path plus two optional external adapters. DirectDesign is the supported default and writes the design inline using the packaged open-source frontend-design philosophy. Claude Design browser or CLI integrations are never assumed, installed, authenticated, or invoked unless the user explicitly selects that adapter and supplies its prerequisites.

## The Problem

Producing good web UI usually means either fighting a visual tool that can't touch your real codebase, or hand-coding from scratch and landing on the same generic defaults every time. The two failure modes pull in opposite directions: visual-first tools give you polish but a handoff gap, while writing code directly gives you integration but flat aesthetics. This skill gives you both routes under one roof — a visual round-trip through claude.ai/design when review matters, or inline design with a real aesthetic doctrine loaded when speed and in-codebase iteration matter — and routes to the right one based on the ask.

## How It Works

Webdesign covers three paths for producing web UI. DirectDesign is the default. Surface the optional adapters only when the user explicitly asks for the external product or when a required artifact already comes from it.

### Path 1 — DirectDesign (default workhorse; the agent writes the design inline)

The agent writes the design directly with Anthropic's open-source `frontend-design` aesthetic doctrine loaded inline. The load-bearing prompt content is mirrored from `github.com/anthropics/skills/tree/main/skills/frontend-design` (MIT-licensed) into `References/FrontendDesignPhilosophy.md` — register list, anti-default rules, type pair recipes, motion vocabulary, color discipline. Self-contained: no Claude runtime, external product, or authentication. Workflow: `DirectDesign`.

### Path 2 — Optional external Claude Design CLI adapter

This path is retained for users who explicitly request Claude Design synchronization and independently maintain a compatible Claude Code installation and subscription. HALOS does not install, configure, authenticate, update, or assume that CLI. `/design-sync` may pull a codebase design system into Claude Design and push built changes back; `/design` may create and edit designs from that external terminal. Workflow: `NativeDesignSync`.

### Path 3 — Optional external Claude Design browser adapter

This adapter is unverified and never selected by default. It may drive the `claude.ai/design` web canvas through an independently configured Interceptor installation when the user explicitly requests that external product. Authentication belongs to a user-selected browser profile; HALOS neither names a fixed profile nor assumes that it is logged in. Workflows: `CreatePrototype`, `ExtractDesignSystem`, `RefinePrototype`, `WebsiteToRedesign`, `ExportToCode`, `IntegrateIntoApp`, `DeployDesign`. Tool: `DriveClaudeDesign.ts`.

### Routing rule

When the user asks for "a nice design" / "design something" without naming a path:

- **Default to DirectDesign** for short, ad-hoc, in-codebase work — speed and in-context iteration.
- **Use the optional external CLI adapter** only when the user explicitly asks for `/design` or `/design-sync` and confirms that the separately managed command is available.
- **Reach for ClaudeDesign (Path 3) only** when visual web-canvas review is explicitly requested and its separate authentication has been arranged.

## Integration-Aware Operation (CRITICAL)

This skill is frequently called as a **sub-step of larger site work** — writing a blog post, building an admin dashboard, shipping a marketing page. When invoked from a parent context, the skill:

- Accepts existing-project context as input: framework, token file, component directory, deployment target.
- Produces output as **diffs / patches against the existing app**, not isolated HTML files.
- Respects existing design tokens and component patterns — does NOT overwrite them unless the user requests a full redesign.
- Routes integration work through `Workflows/IntegrateIntoApp.md`.

When invoked standalone for a greenfield design, the skill produces a self-contained prototype and optionally scaffolds a new app.

## Customization

User-specific design preferences (color palette, typography, spacing grid, animation timing, framework defaults) live outside the installed skill tree at:

```text
<LIFEOS_WORKSPACE>/skills/webdesign/
├── PREFERENCES.md     # Design tokens, preferred frameworks
├── README.md
└── EXTEND.yaml
```

When configured, DirectDesign may read `PREFERENCES.md` to bias its aesthetic and implementation choices. Optional external adapters may include the same approved preferences in a handoff. Without this workspace layer, DirectDesign chooses deliberately from the packaged doctrine; it does not depend on Claude Design defaults.

## Workflow Routing

**When executing a workflow, output this notification:**

```
Running **WorkflowName** in **Webdesign**...
```

| Workflow | Trigger | File |
|----------|---------|------|
| **DirectDesign** *(Path 1 — default, the agent writes inline)* | "make a nice design", "design this directly", "do the design yourself", "design something cool", "frontend aesthetics", "brutalist/editorial/retro/maximalist UI", any short ad-hoc design ask without "prototype" / "mockup" / "claude design" | `Workflows/DirectDesign.md` |
| **NativeDesignSync** *(Path 2 — optional external adapter)* | Explicit requests for "/design", "/design-sync", "design sync", "sync design system", or "native design command" when a separately managed compatible CLI is confirmed | `Workflows/NativeDesignSync.md` |
| **CreatePrototype** *(Path 3 — experimental, drives claude.ai/design)* | "design a prototype", "create prototype", "mockup", "build a design", "claude design", "use claude.ai/design" | `Workflows/CreatePrototype.md` |
| **ExtractDesignSystem** *(Path 3)* | "extract design system", "pull tokens from", "extract brand" | `Workflows/ExtractDesignSystem.md` |
| **RefinePrototype** *(Path 3)* | "iterate on", "refine", "adjust spacing", "change color" | `Workflows/RefinePrototype.md` |
| **WebsiteToRedesign** *(Path 3)* | "redesign this site", "rebuild this URL", "modernize" | `Workflows/WebsiteToRedesign.md` |
| **ExportToCode** *(Path 3 optional adapter)* | "export supplied design", "process external handoff", "convert this handoff bundle" | `Workflows/ExportToCode.md` |
| **IntegrateIntoApp** *(Path 3 optional adapter)* | "integrate this supplied design into", "patch this bundle into the app", "land this external prototype" | `Workflows/IntegrateIntoApp.md` |
| **DeployDesign** *(Path 3)* | "deploy the design", "ship to production" | `Workflows/DeployDesign.md` |

Path 2 and Path 3 are documented optional external adapters. Never route generic code-bound work to them merely because they are available; use DirectDesign unless the user explicitly selects the external product and its prerequisites are confirmed.

## Prerequisites (PREFLIGHT)

Path 1 (DirectDesign) needs nothing beyond Hermes. Path 2 is an optional external adapter and requires an independently installed, authenticated, and supported Claude Code plus a qualifying Claude subscription. HALOS does not manage that lifecycle. **The checks below apply only to Path 3 (ClaudeDesign via Interceptor):**

1. **External Interceptor adapter available** — `which interceptor` must resolve only after the user has selected Path 3. HALOS does not install or configure it.
2. **Authenticated browser profile explicitly selected** — the user must identify an approved profile or session that can access claude.ai. Never assume a profile name, login state, or permission to authenticate.
3. **Claude Design access confirmed** — the separately managed account and organization must expose the product.
4. **For `IntegrateIntoApp`**: parent-project path + framework identifier (next, astro, vitepress, vite-react, vue, vanilla) passed in context.

Missing prerequisites → halt with a clear remediation step. Never silently fall back.

## Gotchas

Accumulate lessons here. Information density is highest in gotchas.

- **Three paths, one supported default.** DirectDesign is Hermes-native. NativeDesignSync and ClaudeDesign/Interceptor are optional external adapters and must be explicitly selected; never silently route an ambiguous request away from DirectDesign.
- **Native-first — code and tokens are the source of truth, Figma is not a dependency.** Import a design system by linking the repo (Claude Design reads real components and tokens from code) or uploading token/component files, never a `.fig` export. Do NOT add a Figma round-trip in either direction (design → `.fig`, or code → editable Figma frames). The bet is that design lives in the codebase, not an external interchange file. If a no-repo visual-review need ever comes up, solve it with a URL/screenshot share, not by coupling the skill to Figma.
- **DirectDesign is self-contained.** The aesthetic doctrine lives in `References/FrontendDesignPhilosophy.md` (mirrored from anthropics/skills MIT source). It has no runtime dependency on the upstream `frontend-design` Claude Code plugin and works in Hermes without any Claude product.
- **Native `/design` + `/design-sync` are external commands, not HALOS capabilities.** Use them only after explicit selection and confirmation of a separately managed compatible CLI and subscription. HALOS neither runs `/update` nor claims the adapter is available merely because this documentation exists.
- **The ClaudeDesign/Interceptor path (Path 3) is an unverified optional adapter.** It must not run unless the user explicitly selects it, identifies an approved authenticated profile, and accepts the external-product boundary. A moved web control, missing authentication, or an unavailable adapter must fail visibly; none of those failures degrades DirectDesign.
- **Path 3 requires its separately approved browser adapter.** Use only the independently configured Interceptor installation and browser profile the user selected during preflight. This constraint belongs to Path 3; DirectDesign uses available Hermes computer/browser verification and does not require Interceptor.
- **Handoff bundles are directories, not single files.** A bundle contains `PROMPT.md`, optional `tokens.json`, `components/`, `assets/`, and framework-specific scaffolding. Treat the whole directory as the unit.
- **The external `frontend-design` plugin is not bundled.** A separately managed Claude Code environment may provide it, but Hermes must not assume its installation, activation, or behavior. DirectDesign uses the packaged doctrine instead.
- **Claude Design's design-system extraction runs during onboarding.** For a new codebase you want Claude Design to understand, run `ExtractDesignSystem` FIRST before `CreatePrototype` — otherwise Claude Design uses generic defaults and overrides your tokens.
- **Integration ≠ overwrite.** `IntegrateIntoApp` produces diffs on top of existing code. If the user wants a full redesign that replaces existing UI, explicitly flag this and get confirmation.
- **Canva exports are editable.** If the user wants a non-developer (marketer, founder) to refine the design, route through `Workflows/ExportToCode.md` with `--format canva`.
- **No real-time collab.** Claude Design does not support multiplayer editing like Figma. Share via URL export for async review.
- **Enterprise gate.** Enterprise accounts need an admin to enable Claude Design in Organization settings before the palette icon appears in claude.ai.
- **Session quotas.** Claude Design generation is token-heavy. As of the June 2026 update its usage shares one pool with claude.ai chat, Claude Code, and Cowork — no longer a separate quota. Pro is thin for sustained design work; Max recommended.
- **Design-system-first is the token fix.** The biggest token sink is re-inferring your brand on every pass and then correcting it. Run `ExtractDesignSystem` once so the system is a fixed reusable reference; every later generation reuses it instead of guessing. Fewer correction cycles = far fewer tokens over a project's life. This is the single highest-leverage move against quota burn.
- **Output fidelity ≠ production-ready.** Any design output needs project tests plus rendered inspection through an available Hermes computer/browser capability. `Tools/VerifyDesign.ts` is only an optional external-adapter probe and requires its own preflight.
- **Vision doesn't guess.** If the prompt doesn't specify responsive breakpoints, contrast requirements, or dark-mode behavior, Claude Design picks defaults that may not match the target app. Be explicit in the brief.

## Examples

**Example 1: Create a pricing-page design through the supported default**
```text
User: "Design a pricing page for an AI security startup — editorial aesthetic, dark only"
→ Invokes DirectDesign
→ Loads the packaged FrontendDesignPhilosophy reference with skill_view
→ Audits the target project's framework, tokens, and component conventions
→ Produces a focused patch in the working tree
→ Runs project tests and verifies the rendered result before claiming completion
```

**Example 2: Process an explicitly supplied external Claude Design prototype**
```text
User: "I exported this Claude Design prototype; integrate it into ~/Projects/landing — it is an Astro site"
→ Confirms the user deliberately selected the external-adapter path and supplied the artifact
→ Audits the target project and bundle without assuming an external plugin
→ Translates the prototype to existing Astro conventions
→ Produces a unified diff and pauses for human review before applying
→ Applies only after approval, runs tests, and verifies the rendered result
```

**Example 3: Redesign an existing live site**
```text
User: "Redesign example.com — modernize, keep the copy, make it brutalist"
→ Defaults to DirectDesign
→ Captures and audits the current state
→ Writes a preserve/change brief and applies the packaged aesthetic doctrine
→ Implements the redesign in the target project
→ Verifies behavior, accessibility, and rendered output
```

## File Organization

```
skills/Webdesign/
├── SKILL.md                          # This file — routing + gotchas
├── README.md                         # Public-facing intro
├── Workflows/
│   ├── DirectDesign.md               # Path 1 — Hermes-native inline design
│   ├── NativeDesignSync.md           # Path 2 — optional external CLI adapter
│   ├── CreatePrototype.md            # Path 3 — optional claude.ai/design adapter
│   ├── ExtractDesignSystem.md
│   ├── RefinePrototype.md
│   ├── WebsiteToRedesign.md
│   ├── ExportToCode.md
│   ├── IntegrateIntoApp.md
│   └── DeployDesign.md
├── Tools/
│   ├── DriveClaudeDesign.ts          # Interceptor wrapper for claude.ai/design
│   ├── ProcessHandoffBundle.ts       # Parse bundle → structured brief
│   └── VerifyDesign.ts               # Optional Interceptor screenshot + tree heuristic
└── References/
    ├── FrontendDesignPhilosophy.md   # Aesthetic doctrine — load-bearing for DirectDesign (MIT-attributed mirror)
    ├── ClaudeDesignCapabilities.md   # What Claude Design does / doesn't do
    ├── InputFormats.md               # Prompt patterns, codebase prep
    ├── ExportFormats.md              # html / pdf / pptx / canva / url / bundle
    └── HandoffBundleSpec.md          # Bundle structure for Claude Code handoff
```

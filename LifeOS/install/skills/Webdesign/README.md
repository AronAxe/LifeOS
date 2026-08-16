# Webdesign

HALOS web-interface design and integration skill for Hermes.

## What It Does

Webdesign turns a design brief into working interface code, integrates it into an existing application, and verifies the rendered result. The supported default is **DirectDesign**: Hermes loads the packaged frontend-design doctrine, audits the target project, implements a focused change, and exercises the result.

Two external Claude Design adapters are retained for interoperability. They are optional, never selected implicitly, and require the user to provide and approve separately managed products, authentication, and browser or CLI prerequisites.

## Why This Exists

Visual-first tools often produce a handoff gap; direct coding often drifts toward generic defaults. DirectDesign combines aesthetic discipline with the target codebase's actual components, tokens, framework, and verification commands. The optional adapters exist only for users who deliberately want an external Claude Design canvas or synchronization workflow.

## Supported Default: DirectDesign

DirectDesign requires no Claude runtime, subscription, browser profile, or external plugin. It:

1. Loads `References/FrontendDesignPhilosophy.md` with `skill_view`.
2. Audits the target project's framework, tokens, components, and tests.
3. Declares an aesthetic register and output contract.
4. Implements production-grade code in the requested project.
5. Runs the relevant tests and verifies the rendered result before claiming completion.

Mutable personal preferences belong outside the installed skill at:

```text
<LIFEOS_WORKSPACE>/skills/webdesign/PREFERENCES.md
```

## Optional External Adapters

- **NativeDesignSync:** documentation for a separately managed compatible Claude Design/Claude Code installation. HALOS does not install, authenticate, update, or assume that product.
- **ClaudeDesign via Interceptor:** an unverified web-canvas adapter. It requires explicit user selection, an independently configured Interceptor installation, an approved authenticated profile, and external product access.

Failure of either adapter does not impair DirectDesign. Generic design requests route to DirectDesign.

## Examples

```text
"Design a pricing page for an AI security startup. Editorial, dark, restrained."
"Redesign this existing Astro page without changing its copy."
"Audit and polish this dashboard, then verify it in the browser."
```

A request naming Claude Design or a synchronization command is treated as a request for an optional external adapter; prerequisites are checked before any external action.

## Workflows

| Workflow | Status | Purpose |
|----------|--------|---------|
| DirectDesign | Hermes-native default | Brief or existing project → implemented, verified interface |
| NativeDesignSync | Optional external adapter | Explicit synchronization request through a separately managed CLI |
| CreatePrototype | Optional external adapter | Explicit Claude Design web-canvas prototype |
| ExtractDesignSystem | Optional external adapter | Supply project tokens to the external canvas |
| RefinePrototype | Optional external adapter | Refine an existing external artifact |
| WebsiteToRedesign | Optional external adapter | Use a live site as external-canvas input |
| ExportToCode | Optional external adapter | Process a supplied handoff bundle |
| IntegrateIntoApp | Shared integration discipline | Land supplied code or a bundle as a reviewable diff |
| DeployDesign | Consent-gated | Deploy only through an explicitly approved project adapter |

## Related Capabilities

- **Art:** illustrations, diagrams, and standalone visual assets.
- **Remotion:** programmatic video.
- **Hermes computer/browser tools:** render and inspect DirectDesign output without requiring the optional Claude adapters.

## License

See `LICENSE.txt`.

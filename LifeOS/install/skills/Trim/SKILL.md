---
name: Trim
version: 1.1.0
description: "Reduces an explicitly selected always-on context or doctrine file to a supplied byte budget without dropping directives. Uses deterministic redundancy removal first, then human-approved relocation, tightening, and merging with rollback and byte-count verification. USE WHEN /trim, trim context, doctrine file over budget, shrink an always-loaded file. NOT FOR general refactoring, media trimming, or stylistic humanization."
---

# Trim

Reduce one explicitly selected context or doctrine file beneath an explicit byte
budget without weakening its directives. This is a conservative editing workflow,
not a background garbage collector.

## Required inputs

- **target** — an absolute path or a path resolved inside the active project.
- **cap_bytes** — the maximum accepted byte count. If the caller does not supply
  one, inspect project documentation for a declared budget; otherwise ask rather
  than inventing a threshold.
- **approval scope** — which semantic proposals, if any, the principal approves.

Hermes installs no global `context-budgets.json`, `BudgetCheck.ts`, or
`ProposalGC.ts`. Do not claim those services exist.

## Workflow routing

| Trigger | Workflow |
|---|---|
| `/trim <file>`, "trim this context file", "this doctrine is over budget" | `Workflows/Trim.md` |

## Reduction order

1. Read the complete target and measure its encoded byte size.
2. Identify deterministic removals: exact duplicates and entries explicitly marked
   superseded or already absorbed.
3. If still over budget, propose ranked semantic reductions for human approval:
   - **RELOCATE** rarely needed detail to a project-approved reference, leaving a
     precise pointer.
   - **TIGHTEN** verbose wording while preserving every directive.
   - **MERGE** overlapping rules while preserving every distinct condition.
4. Capture rollback state before the first write, apply only approved edits, read
   the complete file back, and remeasure bytes.

## Invariant

A trim never drops a distinct directive. Before every semantic edit, enumerate the
proper nouns, paths, tool names, environment names, conditions, prohibitions, and
imperative verbs in the source text. Every one must survive in the replacement or
in the referenced relocated material. If one does not, reject that edit.

## Safety boundaries

- Never trim a file you have not read completely.
- Re-read immediately before writing if the file may have changed concurrently.
- Do not edit HAL/Hermes operating files without the self-configuration safety
  gate, dependency check, rollback path, and post-change verification.
- Do not commit, push, publish, or delete a backup without explicit approval.
- Stage no unrelated file. A clean byte count is not permission to broaden scope.
- Installed skill directories are read-only; relocation targets belong to the
  active project or another principal-approved documentation root.

## Completion evidence

Lead with `before_bytes → after_bytes` and the declared cap. List each applied
removal, merge, tightening, or relocation; provide the rollback path or repository
diff; and name any candidate rejected by the coverage gate. Never claim success
without a read-back byte count at or below the cap.

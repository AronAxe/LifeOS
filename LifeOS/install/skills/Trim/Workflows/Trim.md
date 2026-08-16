# Trim Workflow

**Goal:** bring one selected context/doctrine file beneath its declared byte cap
without dropping a directive. Deterministic reductions come first; every semantic
judgment requires principal approval.

## Step 0 — Resolve target and budget

1. Resolve the target inside the active project or from an explicit absolute path.
2. Resolve `cap_bytes` from the request or a documented project budget.
3. If either remains ambiguous, stop and ask. Hermes has no installed global
   budget registry to infer from.
4. Confirm the absolute target and cap before any mutation.

## Step 1 — Ground the current state

Read the complete file. Measure bytes from the actual encoded content, not a line
or character estimate. Report:

```text
<target> — <before_bytes>/<cap_bytes> bytes (<percent>% FULL)
```

Set a target with modest headroom when the principal permits it; otherwise the
hard completion condition is simply `after_bytes <= cap_bytes`.

## Step 2 — Deterministic reductions

Identify, without changing the file:

- exact duplicate entries;
- entries explicitly marked `[SUPERSEDED]` with a surviving replacement;
- proposal fragments explicitly marked absorbed into the body whose complete
  directive is verifiably present there.

Show exact source ranges and expected bytes saved. Apply only after approval unless
the request already granted this precise scope. Re-read and remeasure; stop if the
cap is now satisfied.

## Step 3 — Rank semantic proposals

Build a ranked list, each with exact target text, replacement/destination, expected
bytes saved, and risk:

1. **RELOCATE** — move rarely needed mechanism detail or examples into a
   project-approved on-demand reference; leave a one-line pointer.
2. **TIGHTEN** — compress verbose prose while preserving the same force and
   conditions.
3. **MERGE** — combine overlapping rules while preserving every distinct
   directive.

The principal selects proposals. Apply them one at a time.

## Step 4 — Coverage gate before every semantic write

For the original text, enumerate every:

- proper noun and named component;
- file path, command, tool, and environment variable;
- threshold, exception, precondition, and prohibition;
- imperative verb and required verification.

Confirm each survives in the replacement or in relocated content. A missing item
means the edit is invalid. For relocation, first write and verify the destination,
then verify the source pointer, and only then remove the original detail.

## Step 5 — Rollback, write, and verify

Before the first mutation, capture a reversible repository diff or a timestamped
copy beside an approved backup root. Apply only the approved edit. Then:

1. read the complete target back;
2. check structure/syntax appropriate to the file type;
3. measure encoded bytes again;
4. inspect the narrow diff for directive loss and unrelated changes;
5. verify any relocated reference exists and is reachable from the pointer.

Do not commit, push, or publish automatically. If the principal later authorizes
a commit, use the repository that actually owns the target and stage only the
trimmed file plus approved relocation files.

## Output

Lead with:

```text
<name>: <before_bytes> → <after_bytes> bytes; cap <cap_bytes>; <PASS|STILL OVER>
```

Then list applied changes, rollback evidence, verification performed, and any
proposal rejected by the coverage gate. If still over cap, state the remaining
byte reduction required rather than declaring completion.

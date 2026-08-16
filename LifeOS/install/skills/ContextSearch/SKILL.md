---
name: context-search
version: 2.0.0
category: LifeOS
portable: true
description: >
  Use to find and resume prior Hermes work by topic, phrase, date, or partial
  recollection. Searches Hermes session history first, then current-session LCM
  context where appropriate, and expands only the evidence needed.
---

# Context Search — Hermes-Native Prior Work Retrieval

## Sources

- `session_search` is authoritative for Hermes-tracked conversations across sessions.
- `lcm_recall` finds semantically related memories across the LCM corpus.
- `lcm_grep` provides exact/full-text, bounded time, role, and source filters.
- `lcm_expand_query`, `lcm_expand`, and `lcm_load_session` recover detail after locating the right material.
- Direct files/URLs supplied by the user remain primary evidence and must be inspected before session history.

No conversation JSONL directory, work registry, or legacy ContextSearch executable is installed by this skill.

## Workflow

1. Translate the request into distinctive terms, exact phrases, and any explicit time boundary.
2. For prior Hermes conversations, call `session_search`; use `newest` for “where did we leave this” and `oldest` for origin questions.
3. If semantic recall is needed, use `lcm_recall`; use `lcm_grep` for exact text or hard date/source bounds.
4. Inspect result bookends and snippets. Expand only the likely session/message rather than loading the whole archive.
5. Verify resolution/decisions against the end of the session or source file, not merely the matched snippet.
6. Return the conclusion and include the session `link` when referring the principal back to a conversation.

## Date handling

Resolve “today,” “yesterday,” and similar phrases using the current system time and configured timezone before applying a hard time filter. Do not guess dates from model context.

## Resume behavior

When asked to continue work, recover the goal, constraints, last verified state, unresolved blockers, and next executable step. Historical tool output is evidence about what happened then, not proof of current external state; recheck repositories, URLs, services, or files when current state matters.

## Boundaries

Use Knowledge/Hindsight for durable factual memory and the cognitive graph for reviewed decision architecture. Do not use conversation search as evidence that a direct current source does or does not contain something.

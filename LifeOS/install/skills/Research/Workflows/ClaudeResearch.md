# Portable Compatibility Research Workflow

This filename is retained for callers that used the former provider-named route. The workflow is now provider-neutral and uses Hermes-native tools.

## Method

1. Restate the question, freshness requirement, decision context, and expected output.
2. Decompose broad questions into four to eight non-overlapping searches: definition/background, primary evidence, recent developments, technical detail, alternatives, expert or practitioner analysis, counter-evidence, and practical implications.
3. Execute simple searches directly with `web_search`. Use `delegate_task` only for independent bounded angles when parallelism adds real value.
4. Open actual sources with `web_extract`; use `browser_exec` for dynamic pages.
5. Deduplicate claims and URLs, verify decisive evidence, and preserve contradictions.
6. Synthesize with citations, limitations, and open questions.

## Boundaries

- No provider-specific researcher type is required or selected.
- No hidden command or external orchestration harness is implied.
- No API key is assumed.
- Paid or custom source adapters require explicit approval when cost or egress is uncertain.

For ordinary work route to `StandardResearch.md`; for broad work use `ExtensiveResearch.md`; for claim-level adjudication use `DeepVerifiedResearch.md`.

# Standard Research Workflow

Use as the default for research that needs more than one source or perspective but does not require a persistent deep-investigation workspace.

## 1. Frame the task

Record:

- exact question and decision context;
- freshness, geography, and time frame;
- expected output shape;
- source constraints and disallowed egress;
- whether the request concerns published facts, community sentiment, code state, or another source class.

Read `../SourceRoutingProtocol.md` before choosing tools.

## 2. Build complementary searches

Create two to four distinct formulations rather than repeating one query. Cover as relevant:

- primary or official evidence;
- current independent reporting or analysis;
- technical, academic, or practitioner evidence;
- alternatives, failure cases, and disconfirming evidence.

For independent broad workstreams, use one `delegate_task` batch with complete, bounded briefs. Do not specify provider models or undeployed agent types. If the task is small, execute the searches directly.

## 3. Extract evidence

Open the strongest sources with `web_extract`; use `browser_exec` for dynamic public pages. For every material finding record claim, quotation or structured field, URL, title, date, locator, source quality, and limitation.

## 4. Cross-check

Group duplicate claims and trace whether sources are genuinely independent. Apply:

- `HIGH` when strong recoverable evidence has independent confirmation;
- `MED` for credible single-chain support;
- `LOW` for indirect, weak, stale, or incomplete evidence;
- `CONFLICT` when credible sources disagree.

Check every important number, date, causal claim, and current-status assertion. Follow `../UrlVerificationProtocol.md`.

## 5. Synthesize

Return:

1. direct answer or executive summary;
2. verified findings grouped by theme;
3. conflicts and low-confidence items;
4. implications for the stated decision;
5. limitations and open questions;
6. source list with recoverable URLs.

Do not report a fixed agent count, duration, or provider roster. Report actual searches, sources opened, and verification outcomes.

## Completion

The task passes when the requested question is answered at the agreed depth, every material claim has recoverable evidence, contradictions remain visible, and source failures are disclosed.

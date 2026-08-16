# Write TELOS Report Workflow

Generate an evidence-backed strategic report from a user-supplied project/TELOS source. Personal TELOS is not an implied report source; confirm scope, classification, and egress before reading it.

## Inputs

- source directory or explicit artifact set;
- client/project name and audience;
- approved output directory;
- classification and sharing boundary;
- requested format and sections;
- optional instruction to use the shipped web-report template.

Do not infer a client identity, output destination, deployment target, or permission to install dependencies.

## 1. Inventory and manifest the evidence

Locate findings, interviews/observations, recommendations, roadmap, methodology, and narrative evidence. Do not invent missing artifacts. Create a source manifest in the task/output workspace containing stable source IDs, path/URL, title, date, type, classification, and exact locators used.

Assess coverage before writing:

- which claims have primary evidence;
- where interview roles/counts are known;
- contradictions and missing perspectives;
- stale or inaccessible sources;
- requested sections that cannot be supported.

## 2. Build reproducible analysis artifacts

Use JSON or equivalent typed artifacts so the report can be regenerated without re-running the reasoning from scratch.

### `findings.json`

```json
[
  {
    "id": "F1",
    "title": "...",
    "description": "...",
    "evidence": "quoted or summarized evidence",
    "source": "source IDs and locators",
    "severity": "critical | high | medium | low"
  }
]
```

### `recommendations.json`

```json
[
  {
    "id": "R1",
    "title": "...",
    "description": "...",
    "priority": "immediate | short-term | long-term",
    "addresses": ["F1"],
    "owner_or_decision": "...",
    "success_measure": "..."
  }
]
```

### `roadmap.json`

```json
[
  {
    "phase": "Phase 1",
    "title": "...",
    "description": "...",
    "duration": "...",
    "dependencies": ["..."],
    "exit_criteria": ["..."]
  }
]
```

### `methodology.json` and `narrative.json`

Record source coverage, interview count/roles when supported, analytical method, limitations, situation assessment, risk analysis, strategic opportunity, target state, call to action, and decision points. Preserve the distinction between source fact, analysis, and recommendation.

Validate stable IDs, cross-references, allowed enums, required fields, and source locators before rendering.

## 3. Construct the report narrative

Use this default sequence unless the audience requires otherwise:

1. cover and classification;
2. executive summary;
3. situation/current-state assessment;
4. evidence-backed key findings;
5. risk and urgency analysis;
6. strategic opportunity/pivot;
7. recommendations linked to findings;
8. target state and success measures;
9. implementation roadmap with dependencies/exit criteria;
10. decision points and call to action;
11. methodology, limitations, and source notes.

Lead with the decision-relevant answer. Do not hide uncertainty in an appendix or let visual polish outrun evidence quality.

## 4. Choose and generate the output

### Markdown, document, HTML, or PDF

Use the appropriate installed document skill/tool. Keep analysis artifacts beside the output when approved and verify the rendered artifact directly.

### Shipped web report

Resolve the installed Telos skill root as `<TELOS_SKILL_DIR>`, then copy `<TELOS_SKILL_DIR>/ReportTemplate/` to the approved output directory without overwriting unrelated content. Generate `lib/report-data.ts` from the validated artifacts using the template's `ReportData` interface:

- metadata: client name, title, date, classification;
- executive summary and methodology;
- situation assessment;
- `Finding[]`;
- risk analysis and strategic opportunity;
- `Recommendation[]`;
- target state;
- `TimelinePhase[]` roadmap;
- call to action.

The template contains placeholders. Every placeholder must be replaced or deliberately removed; placeholder content is never evidence.

Do not edit an installed template in place. Do not reference a hidden private template or claim an auto-generation script that does not ship.

## 5. Build and inspect

For a web report:

1. review the copied dependency manifest;
2. obtain approval before dependency installation or server startup;
3. install in the output copy only;
4. run the real production build;
5. start a bounded local preview only when needed;
6. inspect cover, executive summary, one finding, one recommendation, roadmap, navigation, links, and responsive layout;
7. check console/build errors and stop the preview server afterward.

For every format verify:

- exact output path and artifact inventory;
- all requested sections and cross-references;
- citations/source locators and numeric claims;
- classification and removal of private/unapproved content;
- no placeholders, broken links, clipped text, or unreadable charts;
- accessible contrast, headings, labels, and print/PDF behavior when applicable.

## 6. Regeneration and change control

Treat the source manifest and typed analysis artifacts as the report's reproducible basis. When evidence changes, update the smallest artifact, validate references, regenerate the output, and rerun the build/render checks. Preserve prior output through source control or an approved backup convention.

## 7. Deliver

Return the final report artifact, analysis-artifact inventory, source coverage, build/render evidence, unresolved limitations, and explicit classification. Publishing, external sharing, emailing, or deployment requires a separate approval and destination verification.

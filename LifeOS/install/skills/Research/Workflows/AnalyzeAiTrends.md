# Analyze AI Trends Workflow

## 1. Define the trend claim

Specify domain and time window: models, agents, hardware, research, regulation, capital, deployment, labor, or adoption. State the hypothesized change, comparison baseline, geography, and what would falsify it.

## 2. Collect dated evidence

Use several independent streams:

- release notes, model/system cards, provider documentation;
- papers, benchmark repositories, standards, and datasets;
- filings, procurement/adoption data, credible surveys;
- policy text and regulator publications;
- downstream product or labor indicators.

Separate event date, publication date, and retrieval date. Social volume and announcements are discovery signals, not adoption proof.

## 3. Normalize comparisons

For benchmark or cost claims record model/version, test version, prompting/tool conditions, sample size, hardware, price date, and evaluator. Never compare provider-reported scores as if conditions were identical. Separate shipped capability, limited preview, demo, roadmap, rumor, and independent reproduction.

## 4. Test the interpretation

Search for counter-signals, stalled deployments, benchmark contamination, changed definitions, survivorship bias, policy delays, and economic constraints. Compare at least two independent evidence streams before calling a movement a trend.

## 5. Output

For each trend report:

```text
trend: observed change
time_window: ...
baseline: ...
evidence: dated source-backed indicators
driver: plausible mechanism
counter_signals: ...
confidence: high | medium | low
leading_indicators: what should move next
lagging_indicators: what would confirm adoption
falsifier: evidence that would overturn the interpretation
implication: bounded decision relevance
```

End with a timeline, disagreements/unknowns, and canonical sources. Verify all current-state claims live before delivery.

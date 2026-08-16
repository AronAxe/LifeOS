# Upgrade Workflow

Generate evidence-backed system-improvement proposals without mutating the system before a human decision.

## 1. Establish current state

Inspect the actual repository, configuration, runtime, tests, installed skills/plugins, and relevant documentation. Recall prior decisions and outcomes through Hindsight and session/LCM history. When the principal maintains a cognitive graph, consult relevant values, tensions, assumptions, and project constraints.

Record evidence paths. A configured TELOS source may inform priorities, but its absence does not authorize a guessed path.

## 2. Run independent evidence tracks

When the scope warrants parallelism, delegate bounded independent tracks such as:

- current implementation and test inventory;
- prior decisions, rejections, failures, and lessons;
- external primary-source changes;
- principal goals and active project constraints.

Use the configured delegation limit. Do not prescribe Claude agent types or fixed fan-out counts.

## 3. Collect external evidence

Use live web research and source-specific skills to inspect release notes, repositories, standards, papers, or documentation. Extract concrete techniques and version/date evidence. Do not run bundled provider scrapers or assume API keys. Optional channel/source registries are inputs, not automatic monitors.

## 4. Classify each candidate first

Every candidate receives one status with evidence:

- **DONE** — equivalent behavior already exists;
- **PARTIAL** — only a bounded delta remains;
- **DISCUSSED/DEFERRED** — previously considered, with the prior reason;
- **REJECTED** — do not resurface unless circumstances changed;
- **NEW/UNVERIFIED** — no prior evidence found.

Then score decision relevance, expected benefit, implementation cost, reversibility, and risk. Missing evidence lowers confidence; it does not become novelty.

## 5. Produce recommendations

For each recommended delta include:

- conclusion and prior status;
- current-state evidence;
- external evidence and source links where applicable;
- expected benefit;
- risk and rollback;
- smallest implementation;
- decisive verification;
- affected components.

Separate discoveries from recommendations. Keep unaccepted candidates ephemeral in the current workspace or ISA.

## 6. Human decision

Stop before implementation. The principal may approve, reject, defer, or narrow each recommendation. A request to continue does not select an unanswered option.

## 7. Implement, verify, learn

For approved work, follow repository governance, make the narrowest reversible change, and run the defined verification gate. Retain only accepted durable decisions or lessons in Hindsight. Do not create scheduled upgrade checks, edit memory stores, publish, or notify externally unless separately requested.

# Upgrade — Example Report

Reference example only. It demonstrates the portable report shape; it is not a live finding, approval, or implementation plan.

---

```text
User: "evaluate whether HALOS should adopt a newly documented Hermes lifecycle capability"

# HALOS Upgrade Report
Generated: <UTC timestamp>
Decision boundary: recommendation only; no mutation authorized
Sources processed: 3 canonical documents | 4 local files | 2 prior-decision searches
Findings: 3 classified | 1 recommendation | 2 skipped

## Discoveries

| # | Discovery | Source | Evidence | HALOS relevance | Classification |
|---|---|---|---|---|---|
| 1 | The Hermes plugin contract documents a lifecycle event relevant to the candidate | Official Hermes documentation, version/date recorded | Canonical URL plus quoted supporting passage | May permit native implementation without a private hook | NEW/UNVERIFIED |
| 2 | The installed LifeOS plugin already registers an adjacent lifecycle callback | Local plugin entry point | `<plugin-file>:<line>` and registration test | Narrows the possible change to a bounded delta | PARTIAL |
| 3 | A similar proposal was previously rejected because rollback was undefined | Hindsight/session evidence | `<memory-or-session-handle>` | The old rejection remains binding unless the new mechanism resolves it | REJECTED |

## Recommendations

### HIGH — Evaluate a bounded compatibility delta

| # | Recommendation | Prior Status | Evidence | Expected benefit | Risk / rollback | Effort | Files Affected |
|---|---|---|---|---|---|---|---|
| 1 | Add a focused compatibility test for the documented lifecycle event before proposing implementation | PARTIAL | Official contract plus existing adjacent registration at `<plugin-file>:<line>` | Determines whether a native Hermes route can replace unsupported upstream machinery | Test-only first; delete the test fixture if the contract is unavailable | Low | `<focused-test-file>` |

### No immediate implementation

The external capability is documented, but local runtime behavior is not yet proven. Do not change plugin registration, configuration, or live services until the compatibility test succeeds and the principal approves the implementation delta.

## Technique Details

### Lifecycle capability compatibility check

**Source:** `<canonical documentation URL>`

**Version/date:** `<version or publication date>`

**Supporting passage:** "<direct quotation>"

**Locator:** `<heading, anchor, or line range>`

**Local baseline:**

- plugin registration: `<plugin-file>:<line>`;
- current focused test: `<test-file>:<line>`;
- runtime/config dependency: `<path or command evidence>`;
- prior decision: `<memory or session handle>`.

**Smallest experiment:**

1. Add a test fixture that invokes the documented lifecycle path in isolation.
2. Assert registration, event shape, failure behavior, and absence of unintended persistence.
3. Run the focused test and the complete repository gate.
4. Report the result and stop for approval.

**Falsification condition:** The documented event is unavailable in the supported Hermes version, changes an incompatible payload, or requires an unapproved runtime/configuration mutation.

**Rollback:** Remove the isolated fixture and test. No live configuration or installation state changes during evaluation.

## Summary

| # | Candidate | Prior Status | Confidence | Decision |
|---|---|---|---|---|
| 1 | Native lifecycle compatibility test | PARTIAL | Medium pending runtime proof | PROPOSE |
| 2 | Immediate plugin implementation | UNVERIFIED | Low | DEFER |
| 3 | Previously rejected private-hook design | REJECTED | High | SKIP |

Totals: 0 critical | 1 high | 1 deferred | 1 rejected

## Skipped Content

| Content | Source | Why Skipped | Evidence |
|---|---|---|---|
| Private upstream hook design | Retained legacy documentation | Unsupported by the Hermes installation contract | Capability ledger entry |
| Unversioned community claim | Secondary discussion | No canonical contract or reproducible evidence | Source-quality review |
| Automatic background activation | Candidate proposal | Requires separate consent and configuration approval | Installation safety policy |

## Sources Processed

- Official Hermes documentation: 1 canonical page, version/date recorded.
- Repository evidence: plugin entry point, capability ledger, focused tests, package metadata.
- Prior context: Hindsight recall and session/LCM search with evidence handles.
- Excluded: mirrors, unsourced summaries, and inaccessible claims.

## Human Decision Required

Approve, reject, defer, or narrow the test-only recommendation. Approval of research does not authorize implementation, installation, plugin activation, configuration changes, scheduling, or publication.
```

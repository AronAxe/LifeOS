# Find Sources Workflow

Discover and rank candidate sources for a future upgrade review. Discovery does not subscribe, schedule, trust, or persist a source automatically.

## 1. Define the evidence need

Specify subsystem, missing knowledge, time horizon, acceptable source types, language/geography, access/cost limit, and update cadence. Typical classes are official release notes, standards, repositories, issue trackers, papers, expert engineering blogs, conference channels, and vendor documentation.

## 2. Search by source class

Use several routes rather than one generic query:

- official product/project domains and changelogs;
- repository releases, commits, issues, and maintainers;
- standards bodies and regulator publications;
- paper indexes and cited authors/labs;
- conference programs, technical channels, and expert link graphs;
- high-quality newsletters/aggregators for discovery only.

Open each candidate and verify ownership, recency, access, and actual relevance. Prefer canonical sources over mirrors.

## 3. Score candidates

Use a documented 1–5 scale for:

- authority/primary-source proximity;
- relevance to the target subsystem;
- demonstrated signal quality;
- update cadence/timeliness;
- accessibility and extraction reliability;
- noise, commercial bias, or manipulation risk;
- ongoing cost/maintenance burden.

Record at least one representative item supporting the score. Popularity alone is not authority.

## 4. Output recommendations

```text
Source: <name>
Canonical URL: <url>
Owner/type: <publisher; release notes, repo, paper feed, channel...>
Evidence need served: <...>
Cadence: <observed or unknown>
Access/cost: <...>
Scores: authority __ relevance __ signal __ accessibility __
Risks/bias: <...>
Representative item: <url/date>
Recommendation: add | trial | watch manually | reject
```

Group candidates into high, medium, and low priority and explain the threshold. Deduplicate syndication and distinguish a source from a single useful item.

## 5. Add only after approval

Present the exact configured registry or linked resource that would change. Obtain approval, merge without deleting existing entries, preserve schema/order, read back the write, and report it. Do not create polling, cron jobs, notifications, provider subscriptions, or credentials as part of source discovery.

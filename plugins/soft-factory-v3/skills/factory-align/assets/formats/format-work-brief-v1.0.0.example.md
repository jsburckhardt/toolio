<format id="WORK_BRIEF_V1" name="Work Brief" purpose="One delivery's agreed scope, acceptance, decisions and tasks.">
- Path: `docs/work/<DATE>-<SLUG>.md`; committed before delivery.
- Use exactly these H2 sections in this order; write `None` for empty sections.
- `## Tasks` is owned by `factory-slice`; `## Status` is kept current by the foreman.
- Delivery evidence goes in PR comments, not in this file.

```markdown
# <TITLE>

Issue: <ISSUE_REF>

## Goal
<GOAL>

## Acceptance criteria
- AC<N>: <OBSERVABLE_CRITERION> | evidence: <EVIDENCE>

## Contracts
<CONTRACTS>

## Constraints
<CONSTRAINTS>

## Out of scope
<EXCLUSIONS>

## Decisions
| # | Decision | Rationale | Decided by | ADR |
|---|---|---|---|---|
| D<N> | <DECISION> | <RATIONALE> | <DECIDER> | <ADR> |

## Open questions and spikes
<OPEN_ITEMS>

## Tasks
<TASKS>

## Status
<STATUS>
```
WHERE:
- <ADR> is String; ADR path when the decision constrains future work, else `-`.
- <CONSTRAINTS> is Markdown.
- <CONTRACTS> is Markdown; interfaces, invariants, errors, config, data shapes.
- <DATE> is String; `YYYYMMDD` of creation.
- <DECIDER> is String; `owner` or `delegated`.
- <DECISION> is String.
- <EVIDENCE> is String; the proportionate check that proves the AC.
- <EXCLUSIONS> is Markdown.
- <GOAL> is String; one or two sentences of user-visible outcome.
- <ISSUE_REF> is String; issue link or number, or `None`.
- <N> is Integer.
- <OBSERVABLE_CRITERION> is String; finite and externally observable.
- <OPEN_ITEMS> is Markdown.
- <RATIONALE> is String.
- <SLUG> is String; kebab-case.
- <STATUS> is String; one of `aligning`, `go`, `delivering`, `accepted`, `pr-open`, `done`.
- <TASKS> is Markdown; SLICE_TASK_V1 blocks.
- <TITLE> is String.
</format>

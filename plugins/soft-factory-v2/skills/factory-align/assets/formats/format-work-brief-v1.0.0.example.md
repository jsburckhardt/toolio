<format id="WORK_BRIEF_V1" name="Work Brief" purpose="Single issue-linked record of agreed scope, acceptance and decisions.">
- Store in the repository's existing work-record location, linked from the issue.
- Use exactly these H2 sections in this order; write `None` for empty sections.
- `## Tasks` is owned by `factory-slice` using SLICE_TASK_V1.

```markdown
# <ISSUE_REF> <TITLE>

## Goal
<GOAL>

## Acceptance criteria
- AC<N>: <OBSERVABLE_CRITERION> | evidence: <DECISIVE_EVIDENCE>

## Contracts
<CONTRACTS>

## Constraints
<CONSTRAINTS>

## Out of scope
<EXCLUSIONS>

## Decisions
| # | Decision | Rationale | Decided by |
|---|---|---|---|
| D<N> | <DECISION> | <RATIONALE> | <DECIDER> |

## Open questions and spikes
<OPEN_ITEMS>

## Tasks
<TASKS>

## Status
<STATUS>
```
WHERE:
- <CONSTRAINTS> is Markdown; technical, cost, privacy and environment limits.
- <CONTRACTS> is Markdown; public interfaces, invariants, errors, config and data shapes.
- <DECIDER> is String; `owner` or `delegated`.
- <DECISION> is String.
- <DECISIVE_EVIDENCE> is String; test, command or owner evaluation that proves the AC.
- <EXCLUSIONS> is Markdown.
- <GOAL> is String; one or two sentences of user-visible outcome.
- <ISSUE_REF> is String; for example `#13`.
- <N> is Integer.
- <OBSERVABLE_CRITERION> is String; finite and externally observable.
- <OPEN_ITEMS> is Markdown; each item links a spike report or states owner and blocker.
- <RATIONALE> is String.
- <STATUS> is String; one of `aligning`, `go`, `delivering`, `accepted`, `pr-open`.
- <TASKS> is Markdown; SLICE_TASK_V1 blocks.
- <TITLE> is String.
</format>

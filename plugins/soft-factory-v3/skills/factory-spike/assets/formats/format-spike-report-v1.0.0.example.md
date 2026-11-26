<format id="SPIKE_REPORT_V1" name="Spike Report" purpose="Evidence and recommendation from one approved, bounded spike.">
- Write to `docs/spikes/<DATE>-<SLUG>.md`.
- Use exactly these H2 sections in this order; write `None` for empty sections.
- Do not include secrets or private data.

```markdown
# Spike: <QUESTION>

## Decision it informs
<DECISION>

## Approval and bounds
- Approved by: <APPROVER> on <DATE>
- Bound: <BOUND>
- Exit conditions: <EXIT_CONDITIONS>

## Evidence
<EVIDENCE>

## Options and tradeoffs
| Option | Pros | Cons |
|---|---|---|
| <OPTION> | <PROS> | <CONS> |

## Recommendation
<RECOMMENDATION>

## Exit results
<EXIT_RESULTS>

## Unresolved and proposed ACs
<FOLLOW_UPS>

## Artifacts
<ARTIFACTS>
```
WHERE:
- <APPROVER> is String.
- <ARTIFACTS> is Markdown; experimental code paths and disposition (`delete`, `keep-as-reference`).
- <BOUND> is String; time or effort limit.
- <CONS> is String.
- <DATE> is String; `YYYYMMDD`.
- <DECISION> is String.
- <EVIDENCE> is Markdown; actual probes, sources and negative results.
- <EXIT_CONDITIONS> is String; observable conditions agreed before starting.
- <EXIT_RESULTS> is Markdown; each exit condition with `met`, `not met` or `unknown`.
- <FOLLOW_UPS> is Markdown.
- <OPTION> is String.
- <PROS> is String.
- <QUESTION> is String.
- <RECOMMENDATION> is String; a proposal for alignment, not an approved decision.
- <SLUG> is String; kebab-case.
</format>

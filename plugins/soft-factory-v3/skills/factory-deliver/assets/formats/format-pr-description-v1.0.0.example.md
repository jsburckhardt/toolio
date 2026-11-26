<format id="PR_DESCRIPTION_V1" name="PR Description" purpose="Final delivery PR body: what, why, how to validate, comprehension questions and change impact.">
- Write in plain language for a reviewer who has not read the brief.
- Comprehension questions have no answers in the PR; the reviewer checks they can answer them from the diff and docs.
- Impact is the highest level any change in the PR reaches; never lower it to ease review.
- Worker results, verdicts and harvest proposals go in PR comments, not here.

```markdown
## What
<WHAT>

## Why
<WHY>

## How to validate
<VALIDATION>

## Comprehension check
Reviewer: confirm you can answer these from the diff and docs.
1. <QUESTION_1>
2. <QUESTION_2>
3. <QUESTION_3>

## Change impact: <IMPACT>
<IMPACT_REASON>

Closes <ISSUE_REF> · Brief: <BRIEF_PATH>
```
WHERE:
- <BRIEF_PATH> is Path; `docs/work/YYYYMMDD-<slug>.md`.
- <IMPACT> is String; one of `critical`, `medium`, `low`.
- <IMPACT_REASON> is String; one or two lines naming what drove the level and what review it needs: `critical` needs line-by-line human review (security, auth, data or schema migration, public contract, release, CI, privacy, deletion); `medium` can be reviewed from this description and the changed files (behaviour change within existing contracts); `low` can be merged once checks pass (docs, config, tests, mechanical changes).
- <ISSUE_REF> is String; `#<n>`, or `None`.
- <QUESTION_1> is String; a question about behaviour or design a reviewer must understand to own this code, for example "What happens when the token expires mid-upload?"
- <QUESTION_2> is String; as QUESTION_1, on a different concern.
- <QUESTION_3> is String; as QUESTION_1, on a different concern.
- <VALIDATION> is Markdown; exact commands or steps and their expected results.
- <WHAT> is Markdown; the outcome in a few bullets.
- <WHY> is String; the problem or goal, one or two sentences.
</format>

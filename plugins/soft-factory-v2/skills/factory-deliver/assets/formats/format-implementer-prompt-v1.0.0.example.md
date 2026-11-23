<format id="IMPLEMENTER_PROMPT_V1" name="Implementer Prompt" purpose="Scoped prompt the lead passes to one copilot --yolo -p implementer.">
- Write to `.trees/<TASK_ID>.prompt.md` and pass it to `scripts/worker.sh start`.
- Copy task fields verbatim from SLICE_TASK_V1; do not paraphrase ACs.

```markdown
Use the `soft-factory-v2:factory-deliver` skill in the Implementer role.

Issue: <ISSUE_REF>
Task: <TASK_ID> <OUTCOME>
Worktree: <WORKTREE>
Branch: <BRANCH> from <BASE_SHA>

## Acceptance criteria
<ACS>

## Contracts
<CONTRACTS>

## Design notes
<DESIGN_NOTES>

## Write scope
<WRITE_SCOPE>

## Checks
<CHECKS>

When done, commit and reply only with IMPLEMENTER_RESULT_V1.
```
WHERE:
- <ACS> is Markdown; full AC text from the brief.
- <BASE_SHA> is String; integration head SHA.
- <BRANCH> is String.
- <CHECKS> is String; exact commands.
- <CONTRACTS> is Markdown.
- <DESIGN_NOTES> is Markdown; agreed module and interface decisions relevant to this task.
- <ISSUE_REF> is String.
- <OUTCOME> is String.
- <TASK_ID> is String; for example `T2`.
- <WORKTREE> is Path; under `.trees/`.
- <WRITE_SCOPE> is String.
</format>

<format id="IMPLEMENTER_RESULT_V1" name="Implementer Result" purpose="Evidence an implementer returns to the lead; input to task review, not acceptance.">
- Report only commands actually run and their actual results.
- Every task AC MUST appear in the AC evidence table.
- Posted by the lead as a PR comment; never committed.

```markdown
# Result <TASK_ID>

- Outcome: <OUTCOME>
- Branch: <BRANCH>
- Base: <BASE_SHA>
- Head: <HEAD_SHA>
- Files: <FILES>

## TDD
<TDD>

## Commands
| Command | Result |
|---|---|
| <COMMAND> | <COMMAND_RESULT> |

## AC evidence
| AC | Evidence | Status |
|---|---|---|
| <AC_ID> | <AC_EVIDENCE> | <AC_STATUS> |

## Docs updated
<DOCS_UPDATED>

## Guesses
<GUESSES>

## Escalations
<ESCALATIONS>
```
WHERE:
- <AC_EVIDENCE> is String; test name, command output or observation.
- <AC_ID> is String.
- <AC_STATUS> is String; one of `met`, `not met`, `needs owner`.
- <BASE_SHA> is String.
- <BRANCH> is String.
- <COMMAND> is String.
- <COMMAND_RESULT> is String; exit code and short summary.
- <DOCS_UPDATED> is String; ADR/component/docs paths changed, or `None`.
- <GUESSES> is Markdown; what you had to guess or work out by hand that a command, recipe or doc could have told you, or `None`.
- <ESCALATIONS> is Markdown; unresolved decisions or scope changes, or `None`.
- <FILES> is String; changed paths, comma-separated.
- <HEAD_SHA> is String; committed head.
- <OUTCOME> is String; one of `done`, `blocked`, `failed`.
- <TASK_ID> is String.
- <TDD> is Markdown; failing test observed, then passing, or why TDD was unsuitable.
</format>

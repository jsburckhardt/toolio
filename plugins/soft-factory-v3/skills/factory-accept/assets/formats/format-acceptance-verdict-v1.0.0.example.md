<format id="ACCEPTANCE_VERDICT_V1" name="Acceptance Verdict" purpose="Independent review decision for an exact task, repair or final SHA.">
- Post as a PR comment or return as the requested handoff; never commit it.
- Every relevant AC MUST appear; missing access or owner evaluation is `blocked`.
- `pass` requires no unresolved `blocker` or `major` finding.

```markdown
# Verdict: <VERDICT>

- Kind: <KIND>
- Task: <TASK_ID>
- Base: <BASE_SHA>
- Reviewed head: <HEAD_SHA>

## AC decisions
| AC | Decision | Evidence |
|---|---|---|
| <AC_ID> | <AC_DECISION> | <AC_EVIDENCE> |

## Checks run
| Command | Result |
|---|---|
| <COMMAND> | <COMMAND_RESULT> |

## Findings
| # | Severity | Location | Finding | Suggested fix | Owner |
|---|---|---|---|---|---|
| F<N> | <SEVERITY> | <LOCATION> | <FINDING> | <FIX> | <OWNER> |

## Guesses
<GUESSES>
```
WHERE:
- <AC_DECISION> is String; one of `pass`, `fail`, `blocked`.
- <AC_EVIDENCE> is String; what the reviewer verified, not the builder's claim.
- <AC_ID> is String.
- <BASE_SHA> is String.
- <COMMAND> is String.
- <COMMAND_RESULT> is String; exit code and short summary.
- <FINDING> is String.
- <FIX> is String.
- <GUESSES> is Markdown; what you had to guess or work out by hand that a command, recipe or doc could have told you, or `None`.
- <HEAD_SHA> is String; exact SHA reviewed.
- <KIND> is String; one of `task`, `repair`, `final`.
- <LOCATION> is String; path and line.
- <N> is Integer.
- <OWNER> is String; `implementation` or `design`.
- <SEVERITY> is String; one of `blocker`, `major`, `minor`.
- <TASK_ID> is String; task id, or `combined` for final.
- <VERDICT> is String; one of `pass`, `fail`, `blocked`.
</format>

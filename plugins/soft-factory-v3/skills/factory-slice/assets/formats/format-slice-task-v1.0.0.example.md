<format id="SLICE_TASK_V1" name="Slice Task" purpose="One vertical task inside the work brief Tasks section.">
- Append one block per task under `## Tasks` in WORK_BRIEF_V1.
- `Worker` is `None` for direct tasks.
- Every AC in the brief MUST map to at least one task.
- `Depends on` lists real prerequisites only; list order is not a dependency.

```markdown
### T<N> <OUTCOME>
- Tier: <TIER>
- ACs: <AC_IDS>
- Depends on: <DEPENDS_ON>
- Contracts: <CONTRACTS>
- Write scope: <WRITE_SCOPE>
- Shared files: <SHARED_FILES>
- Resources: <RESOURCES>
- Checks: <CHECKS>
- Docs: <DOCS>
- Status: <STATUS>
- Worker: <WORKER>
```
WHERE:
- <AC_IDS> is String; comma-separated, for example `AC1, AC3`.
- <CHECKS> is String; exact commands that must pass for this task.
- <CONTRACTS> is String; contracts this task provides or consumes, or `None`.
- <DEPENDS_ON> is String; task ids or `None`.
- <DOCS> is String; ADR, component and docs pages this task creates or updates, or `None`.
- <N> is Integer.
- <OUTCOME> is String; demonstrable vertical result, not a layer.
- <RESOURCES> is String; ports, databases or output dirs reserved, or `None`.
- <SHARED_FILES> is String; shared paths with their single owner task, or `None`.
- <TIER> is String; `direct` (foreman, no worker) or `full` (worker, TDD, review). The foreman may raise it, never silently lower it.
- <STATUS> is String; one of `ready`, `blocked`, `in-progress`, `review`, `integrated`, `failed`.
- <WORKER> is String; branch, base SHA, head SHA and PID once dispatched, else `None`.
- <WRITE_SCOPE> is String; paths or globs the worker may change.
</format>

<format id="DECISIONS_ROW_V1" name="Decisions Index Row" purpose="Index entry a model reads to know which ADR or component to open.">
- File: `docs/architecture/decisions.md`; create it with the header below if missing.
- Append one row per ADR or component; update the status cell when it changes.
- Union merge keeps parallel appends; never renumber or reorder.

```markdown
| Date | Kind | Title | Status | Applies to | Link |
|---|---|---|---|---|---|
| <DATE> | <KIND> | <TITLE> | <STATUS> | <APPLIES_TO> | <LINK> |
```
WHERE:
- <APPLIES_TO> is String; paths or areas, for example `internal/collector, config`.
- <DATE> is String; `YYYYMMDD`.
- <KIND> is String; `ADR` or `component`.
- <LINK> is String; relative markdown link.
- <STATUS> is String; ADR or component status.
- <TITLE> is String.
</format>

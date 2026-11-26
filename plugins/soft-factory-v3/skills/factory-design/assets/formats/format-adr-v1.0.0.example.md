<format id="ADR_V1" name="Architecture Decision Record" purpose="One decision that constrains future work.">
- Path: `docs/architecture/adr/<DATE>-<SLUG>.md`.
- Short: a reader should finish it in two minutes.

```markdown
# <TITLE>

- Status: <STATUS>
- Date: <DATE>
- Source: <SOURCE>

## Context
<CONTEXT>

## Decision
<DECISION>

## Consequences
<CONSEQUENCES>

## Alternatives considered
<ALTERNATIVES>
```
WHERE:
- <ALTERNATIVES> is Markdown; one line each with why not.
- <CONSEQUENCES> is Markdown; what becomes easier, harder or forbidden.
- <CONTEXT> is Markdown; the forces, in a few sentences.
- <DATE> is String; `YYYYMMDD`.
- <DECISION> is String; imperative, one paragraph.
- <SLUG> is String; kebab-case.
- <SOURCE> is String; brief path and decision id, for example `docs/work/20261126-x.md D3`.
- <STATUS> is String; one of `accepted`, `superseded by <PATH>`, `deprecated`.
- <TITLE> is String.
</format>

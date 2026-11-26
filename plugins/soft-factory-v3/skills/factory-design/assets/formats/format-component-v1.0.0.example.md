<format id="COMPONENT_V1" name="Component" purpose="What callers must know about one deep module.">
- Path: `docs/architecture/components/<COMPONENT>.md`.
- Describe the interface, not the implementation.

```markdown
# <TITLE>

- Code: <CODE_PATH>
- Status: <STATUS>

## Responsibility
<RESPONSIBILITY>

## Interface
<INTERFACE>

## Invariants and errors
<INVARIANTS>

## Configuration
<CONFIGURATION>

## Depends on
<DEPENDS_ON>

## Tests
<TESTS>

## Decisions
<ADRS>
```
WHERE:
- <ADRS> is Markdown; links to ADRs that shape this component, or `None`.
- <CODE_PATH> is Path.
- <COMPONENT> is String; kebab-case.
- <CONFIGURATION> is Markdown; or `None`.
- <DEPENDS_ON> is Markdown; other components or external services.
- <INTERFACE> is Markdown; caller-facing entry points with signatures.
- <INVARIANTS> is Markdown; guarantees, ordering and failure behaviour.
- <RESPONSIBILITY> is String; one or two sentences.
- <STATUS> is String; one of `active`, `deprecated`.
- <TESTS> is Markdown; the integration tests that prove the interface.
- <TITLE> is String.
</format>

<format id="LLMS_TXT_V1" name="llms.txt" purpose="Root map that tells any model what the project is and which docs to read (llmstxt.org).">
- File: `llms.txt` at the repository root.
- Plain markdown; link only pages that exist; one line per link.
- It points to docs; it does not repeat them. Agent working rules stay in `AGENTS.md`.
- Use repository-relative links; use absolute URLs only when docs are published.

```markdown
# <PROJECT>

> <SUMMARY>

<CONTEXT>

## Docs
- [Getting started](docs/getting-started.md): install and first run
- [Usage](docs/usage/): <USAGE_NOTE>
- [Operations](docs/operations/): <OPERATIONS_NOTE>

## Architecture
- [Overview](docs/architecture/overview.md): context and component map
- [Decisions](docs/architecture/decisions.md): index of ADRs and components

## Optional
- [Development](docs/development/): environment, testing, CI
- [AGENTS.md](AGENTS.md): rules for agents changing this repository
```
WHERE:
- <CONTEXT> is Markdown; up to three lines a model needs before reading further (language, runtime, key constraints), or omitted.
- <OPERATIONS_NOTE> is String; what operations pages cover.
- <PROJECT> is String; project name.
- <SUMMARY> is String; one sentence on what it does and for whom.
- <USAGE_NOTE> is String; what usage pages cover.
</format>

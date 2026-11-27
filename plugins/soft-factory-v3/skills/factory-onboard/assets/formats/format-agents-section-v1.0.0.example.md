<format id="AGENTS_SECTION_V1" name="AGENTS.md Soft Factory Section" purpose="Route every session and worker in a repository to the v3 flow.">
- Insert into root `AGENTS.md`; create the file only if missing.
- Replace only the text between the markers; preserve everything else.
- Route to the foreman and skills; do not restate their procedures.
- List only verified commands; never write placeholders.

```markdown
<!-- soft-factory-v3:begin -->
## How we deliver
Start sessions with the `foreman` agent (`copilot --agent foreman` or `/agent`). It syncs state, picks the phase and runs
the `factory-*` skills in `.github/skills/`. Vendored from <SOURCE> at <COMMIT>.

## Docs
- Keep README short: what it is, quickstart, links. Everything else goes in `docs/`.
- Read `docs/architecture/decisions.md` first; it indexes ADRs and components.
- Keep `llms.txt` links current when docs pages are added, moved or removed.
- Dated files are `YYYYMMDD-<slug>.md` (work, adr, spikes).

## Rules
- Questions are not authorisation to change things.
- The owner merges and releases unless delegated.
- Never commit secrets; read credentials from the environment.
- Tooling uses <LANGUAGE> or plain bash; another runtime needs owner approval.
- Do not create unrequested side files; clean up what you create.
- When a task changes build/test/lint commands, update `## Commands` in the same task.

## Commands
<COMMANDS>
<!-- soft-factory-v3:end -->
```
WHERE:
- <COMMANDS> is Markdown; verified `- <purpose>: \`<command>\`` lines, or `None yet.`.
- <COMMIT> is String; short source commit SHA.
- <LANGUAGE> is String; the project's primary language, or `the agreed language` for an empty repo.
- <SOURCE> is String; for example `jsburckhardt/toolio plugins/soft-factory-v3`.
</format>

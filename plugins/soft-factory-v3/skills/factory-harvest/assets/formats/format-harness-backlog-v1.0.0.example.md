<format id="HARNESS_BACKLOG_V1" name="Harness Backlog Entry" purpose="One proposed harness fix from a delivery's guesses.">
- File: `docs/development/harness-backlog.md`; create with `# Harness backlog`, `## Repo` and `## Factory` headings if missing.
- Repo-harness entries go under `## Repo`; factory process friction under `## Factory`.
- At most three entries per delivery; set status to `done` or `dropped` instead of deleting.

```markdown
### <DATE> <TITLE>
- Guess: <GUESS>
- Fix: <FIX_KIND> — <FIX>
- Source: <SOURCE>
- Status: <STATUS>
```
WHERE:
- <DATE> is String; `YYYYMMDD`.
- <FIX> is String; the exact line, recipe or script behaviour proposed.
- <FIX_KIND> is String; one of `AGENTS line`, `just recipe`, `script`, `factory`.
- <GUESS> is String; what agents had to guess, and how often or how long.
- <SOURCE> is String; brief path, task ids or PR.
- <STATUS> is String; one of `proposed`, `approved`, `done`, `dropped`.
- <TITLE> is String.
</format>

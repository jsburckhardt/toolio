# Module 3 — Research Stage

## Run

```bash
workshop scaffold research "<topic>"
# author the draft, then:
workshop status        # see pendingScaffoldDrafts
workshop accept-draft <id>
workshop coach post-research-coach
```

## Harness Invariants

- A draft appears in `pendingScaffoldDrafts` after `scaffold research`.
- `DECISION-LOG.md` is unchanged by scaffolding alone.
- `accept-draft` moves the artifact to a canonical path.

## Debrief

- Did the coach flag a category you had not considered?
- What evidence is still missing from the brief?

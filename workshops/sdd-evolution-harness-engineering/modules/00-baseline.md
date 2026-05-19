# Module 0 — Baseline

> 90-minute condensed agenda reference: see the workshop [README — 90-minute condensed agenda](../README.md#90-minute-condensed-agenda).

## Run

```bash
workshop start
workshop status
workshop install-hooks
workshop status
```

## Harness Invariants

- `.workshop-state.json` exists at repo root.
- `.workshop-state.json` listed in `.gitignore`.
- Three sensors installed under `.git/hooks/`, each with line-1 marker.
- `workshop status` exits 0 and lists installed hooks.

## Debrief

- What did `workshop start` do that you could not see directly?
- Which sensors fired? Which were silent? Why?
- Where would you put a guide that humans read but agents ignore?

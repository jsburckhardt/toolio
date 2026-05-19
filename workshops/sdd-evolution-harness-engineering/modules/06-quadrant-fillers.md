# Module 6 — Quadrant Fillers

## Run

```bash
workshop diagnose 2x2 --json | jq '.empty_quadrants'
workshop scaffold guide  "fill computational-guides"
workshop scaffold sensor "fill computational-sensors"
workshop diagnose 2x2
```

## Harness Invariants

- After scaffolding, the named quadrants are no longer empty.
- Scaffolds emit drafts only; canonical files unchanged until accept-draft.

## Debrief

- Which empty quadrant is structural vs. accidental?
- Which filler would you keep in production?

# Module 7 — Fan-Out

## Run

```bash
workshop fan-out --count 2
ls .workshop-fanout/
cat .workshop-fanout/collision-report.txt
```

## Harness Invariants

- Each worktree has its own `.workshop-state.json`.
- Each worktree holds its own per-`git-common-dir` flock.
- Collision report names overlapping canonical paths.

## Debrief

- Which canonical files are the genuine collision points?
- How would two agents coordinate around them safely?

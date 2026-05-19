# Module 4 — Plan Stage

## Run

```bash
workshop scaffold plan "<scope>"
workshop scaffold adr  "<decision title>"
workshop status
workshop accept-draft <plan-id>
workshop accept-draft <adr-id>
```

## Harness Invariants

- Two distinct drafts appear in pendingScaffoldDrafts.
- `pre-commit-plan-gate` blocks a commit that touches `project/issues/<N>/plan/` without `01-action-plan.md` + `02-task-breakdown.md`.

## Debrief

- Which decision deserved an ADR vs. a comment in the action plan?
- What is the smallest plan that still survives review?

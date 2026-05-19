# Module 5 — Implement & Promote

## Run

```bash
workshop scaffold verify "<feature>"
workshop install-promote-ephemeral <issue-number>
workshop verify
```

## Harness Invariants

- `pre-pr-verify-gate` enforces canonical `project/issues/<N>/` layout.
- After promotion, `workshop verify` exits 0.

## Debrief

- Where would a non-canonical path have leaked into the PR without the gate?
- What did promotion silently rename?

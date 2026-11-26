---
name: factory-slice
description: "Turn agreed acceptance into vertical slices with tiers, dependencies, expected docs and safe worker ownership."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory slice

Create demonstrable vertical outcomes first; consider parallel execution second.

1. Start from agreed ACs/design. The first slice proves a thin integrated path across
   necessary layers, not all database work followed by all backend and UI work.
2. Under the brief's `## Tasks`, record each task using
   [format-slice-task](assets/formats/format-slice-task-v1.0.0.example.md).
   Set `Tier`: `direct` for config, docs and small mechanical changes (the foreman
   does them, no worker, no TDD); `full` for behaviour code (worker, TDD, review).
   List expected docs: ADRs, component docs and the docs page each task updates.
   Reject missing prerequisites and cycles; list order is not a dependency.
3. Keep one delivery issue/integration branch/final PR. Worker branches are internal
   tasks. Split oversized initiatives into useful delivery issues, not giant PRs.
4. Parallelise only ready tasks with stable contracts, disjoint writes and separable
   ports/databases/output directories. At most two implementers.
   Shared files have one owner (`decisions.md` is exempt: union merge). Uncertainty
   or shared-file churn favours sequential work.
5. Unlock dependants only after reviewed prerequisites integrate and pass combined
   checks. Do not create horizontal tasks merely to keep workers occupied.

## References

Continue with `factory-deliver` after agreement.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-slice-task-v1.0.0.example.md`: SLICE_TASK_V1 contract.

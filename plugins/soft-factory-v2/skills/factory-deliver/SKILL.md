---
name: factory-deliver
description: "Resume an agreed delivery, run TDD workers in .trees, independently review, serially integrate and publish an accepted PR."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
  framework_revision: "0.1.0"
  last_updated: "2026-11-21"
---

# Factory deliver

Coordinate one approved issue through implementation and independent acceptance.
Read the reference and use the bundled helper only for the lifecycle operations it
actually checks; preserve the lead's design and evidence responsibilities.

## References

1. [Delivery and worktree execution](references/00-delivery.md)

## Skill layout

- `SKILL.md`: entry point.
- `references/00-delivery.md`: TDD, dispatch, result schemas, integration and recovery.
- `scripts/worktrees.mjs`: foreground git/worktree/worker lifecycle helper.

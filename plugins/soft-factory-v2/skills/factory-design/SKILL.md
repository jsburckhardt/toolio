---
name: factory-design
description: "Design deep modules with simple caller commitments, locality and meaningful integration-test surfaces."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory design

Design for leverage, locality and testability throughout delivery. A deep module
provides useful behaviour behind a small interface, not a large file or many methods.

1. Treat an interface as everything callers must know: behaviour, signatures,
   invariants, ordering, errors, configuration and relevant performance. Hide related
   internal coordination rather than spreading it across callers.
2. Prefer established patterns and the smallest coherent change. If deleting an
   abstraction removes complexity, question its value; if complexity spills into
   callers, it may earn its keep. Add seams/adapters for demonstrated needs, not
   hypothetical future variation. Small internal functions remain useful.
3. Agree meaningful behaviour, ownership, contracts and failure cases before coding.
   Compare alternatives for consequential choices. Delegate internal algorithms and
   helpers; return material departures to alignment.
4. Prefer a few high-value integration/system tests through caller-facing interfaces
   over thousands of unit tests. Use unit tests where they add distinct confidence;
   do not delete useful coverage merely to reduce counts.
5. Include relevant failure/ordering checks and proportionate observability without
   sensitive data. Require running UI evidence for visual changes, appropriate API/
   integration evidence otherwise. Local passes cannot certify cloud-only behaviour.
6. Update existing architectural decisions/contracts when genuinely affected. Do not
   create an ADR per helper, a component document per file or unrelated refactors.

## References

Apply during `soft-factory-v2:factory-align`, `soft-factory-v2:factory-deliver`
and `soft-factory-v2:factory-accept`. Vocabulary draws on deep modules and seams.

## Skill layout

- `SKILL.md`: self-contained instructions.

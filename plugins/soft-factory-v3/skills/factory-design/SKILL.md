---
name: factory-design
description: "Design deep modules with small interfaces and integration-test surfaces, and record durable ADRs and component docs."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory design

Design for leverage, locality and testability throughout delivery. A deep module
provides useful behaviour behind a small interface, not a large file or many methods.

1. Treat an interface as everything callers must know: behaviour, signatures,
   invariants, ordering, errors, configuration and relevant performance.
2. Prefer established patterns and the smallest coherent change. Add seams for
   demonstrated needs, not hypothetical variation.
3. Prefer a few high-value integration tests through caller-facing interfaces.
   Use unit tests where they add distinct confidence.
4. Keep evidence and observability proportionate; no harness code to prove config.
5. Record durable knowledge, in the same commit as the change:
   - a decision that constrains future work: ADR at
     `docs/architecture/adr/YYYYMMDD-<slug>.md` using
     [format-adr](assets/formats/format-adr-v1.0.0.example.md);
   - a new or changed deep-module interface: component doc at
     `docs/architecture/components/<name>.md` using
     [format-component](assets/formats/format-component-v1.0.0.example.md);
   - one row per ADR/component in `docs/architecture/decisions.md` using
     [format-decisions-row](assets/formats/format-decisions-row-v1.0.0.example.md).
   Parallel appends to `decisions.md` are expected; `merge=union` keeps both.
6. Supersede ADRs rather than editing accepted ones. Do not create an ADR per
   helper or a component doc per file.

## References

1. [format-adr](assets/formats/format-adr-v1.0.0.example.md)
2. [format-component](assets/formats/format-component-v1.0.0.example.md)
3. [format-decisions-row](assets/formats/format-decisions-row-v1.0.0.example.md)
4. Applied during `factory-align`, `factory-deliver` and `factory-accept`.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-adr-v1.0.0.example.md`: ADR_V1 contract.
- `assets/formats/format-component-v1.0.0.example.md`: COMPONENT_V1 contract.
- `assets/formats/format-decisions-row-v1.0.0.example.md`: DECISIONS_ROW_V1 contract.

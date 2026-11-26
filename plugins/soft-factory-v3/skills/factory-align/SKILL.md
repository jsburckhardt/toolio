---
name: factory-align
description: "Grill through a proposed change, trim it to one coherent outcome and agree finite, proportionate acceptance before implementation."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory align

Reach shared understanding before implementation, rather than eagerly generating a plan.

1. Read the issue, `docs/architecture/decisions.md`, relevant ADRs/components,
   code and tests. Find facts yourself; verify tool/API claims or label them
   unverified. Do not share private inputs with external research services.
2. Map decisions by prerequisites. Ask the currently answerable questions through
   `ask_user` in numbered rounds, with recommendations that "yes" accepts. Wait for
   answers before asking dependent questions. Challenge weak proposals.
3. Resolve scope, finite observable ACs, exclusions, behaviour/defaults/failures,
   contracts and constraints. Request an approved spike only for material
   experimental uncertainty.
4. Keep evidence proportionate: config and docs are proven by building/running
   them and one check, not by new harness code. New tooling in another runtime
   needs explicit owner approval.
5. Size check before go: ask "is this still one coherent outcome?" and propose
   concrete cuts or a split into separate deliveries. Grilling must trim scope,
   not only add it.
6. Mark decisions that constrain future work as ADR candidates.
7. Write the brief to `docs/work/YYYYMMDD-<slug>.md` using
   [format-work-brief](assets/formats/format-work-brief-v1.0.0.example.md) and
   commit it. Confirm shared understanding and get explicit go.
8. Any later owner question uses
   [format-escalation](assets/formats/format-escalation-v1.0.0.example.md).
   Consequential behaviour, contract, dependency, cost or privacy changes return here.

## References

1. [format-work-brief](assets/formats/format-work-brief-v1.0.0.example.md)
2. [format-escalation](assets/formats/format-escalation-v1.0.0.example.md)
3. Use `factory-design` throughout, `factory-spike` when approved, then `factory-slice`.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-work-brief-v1.0.0.example.md`: WORK_BRIEF_V1 contract.
- `assets/formats/format-escalation-v1.0.0.example.md`: ESCALATION_V1 contract.

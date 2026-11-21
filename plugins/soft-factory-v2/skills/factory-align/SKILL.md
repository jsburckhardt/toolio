---
name: factory-align
description: "Grill through a proposed change, capture consequential decisions and agree finite acceptance before implementation."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory align

Reach shared understanding before implementation, rather than eagerly generating a plan.

1. Read the issue, relevant code/tests and existing decisions. Find facts yourself;
   verify tool/API claims or label them unverified. Do not share private inputs with
   external research services.
2. Map decisions by prerequisites. Ask the currently answerable questions through
   `ask_user` in numbered rounds, with recommendations that "yes" accepts. Wait for
   answers before asking dependent questions. Challenge weak proposals.
3. Resolve scope, finite observable ACs, exclusions, behaviour/defaults/failures,
   public contracts, constraints and decisive evidence. Involve the actual owner for
   domain decisions. Request an approved spike for material experimental uncertainty.
4. Capture commitments, rationale, owner answers and delegated choices in one
   issue-linked work brief, using the repository's conventions. Preserve existing
   records; do not duplicate facts across mandatory stage documents.
5. Confirm shared understanding and delivery go. A question is not authorisation to
   edit/create/install. After go, routine implementation is autonomous; consequential
   behaviour, contract, dependency, cost or privacy changes return to alignment.

## References

Use `soft-factory-v2:factory-design`, `soft-factory-v2:factory-spike` when needed,
then `soft-factory-v2:factory-slice`.

## Skill layout

- `SKILL.md`: self-contained instructions.

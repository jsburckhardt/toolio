---
name: factory-accept
description: "Independently review an exact task, integration repair or final SHA against design, standards and acceptance evidence."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory accept

Review in a fresh context independent of the builder. Do not repair application code,
commit, dispatch workers, merge, push or release.

1. Read the actual issue/ACs, agreed design, applicable standards and exact base/head
   SHAs. Inspect the complete relevant diff, tests and affected docs. Treat builder
   reports as leads to verify, not proof.
2. For task review, check owned ACs, write scope, contracts and decisive tests. For
   integration repair, examine conflict/fix changes from the last good head. For final
   acceptance, verify the combined result, all ACs and current full/integration checks;
   final review is the only review of direct-tier tasks, so inspect them fully.
   Also check: docs sit in the `docs/` tree, not the README; ADR/component files match
   `docs/architecture/decisions.md`; no second runtime without owner approval; no
   leftover side files, worktrees or stray branches; evidence is proportionate.
3. Apply the design skill. Reuse valid reviewed evidence without redundant mandatory
   line reviews; changed code and integration effects require renewed attention.
4. Report actual command/results and an evidence-backed decision for every relevant
   AC. Missing access or subjective owner evaluation remains blocked, not passed.
   Reject unresolved blocker/major defects; keep meaningful minor findings visible.
5. Return the verdict using
   [format-acceptance-verdict](assets/formats/format-acceptance-verdict-v1.0.0.example.md)
   as a PR comment or the requested handoff, never a commit. Include `## Guesses`.
6. Route defects to their owner. After two unsuccessful corrections of the same
   finding, request an owner decision. A later code change invalidates affected evidence.
   Acceptance permits PR creation under the agreed go, not implicit merge/release.

## References

Use `factory-design`; return findings to `factory-deliver` or `factory-align`.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-acceptance-verdict-v1.0.0.example.md`: ACCEPTANCE_VERDICT_V1 contract.

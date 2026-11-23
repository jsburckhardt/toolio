---
name: factory-onboard
description: "Discover a new or existing repository and add the Soft Factory v2 delivery section to AGENTS.md without rewriting the application."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory onboard

Understand a new or existing repository before delivery and route every session to
the v2 flow through `AGENTS.md`. Do not turn onboarding into scaffolding, environment
configuration or an application rewrite. For an empty repository, do only step 5.

1. Read repository instructions, source/tests, relevant architecture, git state and CI.
   Discover actual commands and existing `just` recipes; do not invent capabilities.
2. Check repository-local commit identity/signing. Preserve dirty work and existing
   conventions. Work in the existing devcontainer without repeated container setup.
3. Identify real focused/full checks, image builds and relevant integration/UI evidence.
   Suggest missing checks; do not install tools, edit the devcontainer or generate
   placeholder checks unless explicitly requested.
4. Record local-versus-deployed limitations, access prerequisites and merge/release
   authority in the existing project/work record. Keep secrets out of tracked files.
5. Add or update the delivery section in root `AGENTS.md` using
   [format-agents-delivery-section](assets/formats/format-agents-delivery-section-v1.0.0.example.md).
   Fill `## Commands` only with commands verified in step 3. Preserve all other content.
6. Return a concise repository understanding and genuine blockers. Do not create a
   new documentation hierarchy or replace v1 instructions.

## References

Continue with `soft-factory-v2:factory-align` for a delivery request.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-agents-delivery-section-v1.0.0.example.md`: AGENTS_DELIVERY_SECTION_V1 contract.

---
name: factory-onboard
description: "Discover an existing repository and establish the Soft Factory v2 delivery contract without rewriting the application."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory onboard

Understand an existing repository before delivery. Do not turn onboarding into
scaffolding, environment configuration or an application rewrite.

1. Read repository instructions, source/tests, relevant architecture, git state and CI.
   Discover actual commands and existing `just` recipes; do not invent capabilities.
2. Check repository-local commit identity/signing. Preserve dirty work and existing
   conventions. Work in the existing devcontainer without repeated container setup.
3. Identify real focused/full checks, image builds and relevant integration/UI evidence.
   Suggest missing checks; do not install tools, edit the devcontainer or generate
   placeholder checks unless explicitly requested.
4. Record local-versus-deployed limitations, access prerequisites and merge/release
   authority in the existing project/work record. Keep secrets out of tracked files.
5. Return a concise repository understanding and genuine blockers. Do not create a
   new documentation hierarchy or replace v1 instructions.

## References

Continue with `soft-factory-v2:factory-align` for a delivery request.

## Skill layout

- `SKILL.md`: self-contained instructions.

---
name: factory-onboard
description: "Onboard a new, existing or already-onboarded repository to Soft Factory v3: docs structure, AGENTS.md section and vendored skills."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory onboard

Make a repository ready for v3 delivery without rewriting the application. The
foreman chooses the mode; do not ask the owner which mode applies.

| Mode | Detected when | Do |
|---|---|---|
| new | no application code, no v3 `AGENTS.md` section | steps 1, 3, 4, 5 |
| existing | code exists, no v3 `AGENTS.md` section | steps 1-5 |
| update | v3 section exists, vendored version older than source | steps 1, 5 |

1. Vendoring: copy the source plugin's `skills/*` to `.github/skills/` and
   `agents/*` to `.github/agents/`, replacing previous `factory-*` and
   `foreman.agent.md` copies only. Record the source repo and commit in the
   `AGENTS.md` section. Tell the owner to reload skills/agents in open sessions.
2. Discover: read instructions, source, tests, CI, `just` recipes, git default
   branch, commit identity/signing and the devcontainer. Record only commands that
   actually run. Report a second default branch or second runtime as a finding.
   Do not install tools, edit the devcontainer or generate placeholder checks.
3. Docs: create only the missing directories and `index.md` files of
   [format-docs-tree](assets/formats/format-docs-tree-v1.0.0.example.md). In
   existing mode, propose a move plan for misplaced docs (README sections, root
   briefs) as a direct-tier task; do not move content during onboarding.
4. Add or update the `AGENTS.md` section using
   [format-agents-section](assets/formats/format-agents-section-v1.0.0.example.md),
   between its markers, preserving all other content. Add
   `docs/architecture/decisions.md merge=union` to `.gitattributes`.
5. Commit onboarding changes before any delivery; worktrees only see commits.
   Return repository understanding, findings and the next foreman step.

## References

1. [format-docs-tree](assets/formats/format-docs-tree-v1.0.0.example.md)
2. [format-agents-section](assets/formats/format-agents-section-v1.0.0.example.md)

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-docs-tree-v1.0.0.example.md`: DOCS_TREE_V1 contract.
- `assets/formats/format-agents-section-v1.0.0.example.md`: AGENTS_SECTION_V1 contract.

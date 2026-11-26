---
name: factory-harvest
description: "After a delivery, turn repeated or costly agent guesses into at most three small harness fixes in docs/development/harness-backlog.md."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory harvest

Learn from one delivery without building anything. Run once, after final acceptance
and before the PR. Propose only; do not implement.

1. Collect `## Guesses` from this delivery's implementer results and verdicts, plus
   friction signals: repair workers, failed reviews, escalations, owner corrections
   and tier upgrades.
2. Keep only guesses that repeated or cost real time. "Nothing worth fixing" is a
   valid and common outcome; then stop.
3. If a friction signal fired, ask the owner once through `ask_user`: "Anything
   annoying in this delivery?" Otherwise do not ask.
4. Propose at most three fixes, each the smallest that removes the guess, preferring
   an `AGENTS.md` line, then a `just` recipe, then a script. No new runtime, tool or
   framework. Process friction about the factory itself goes under `## Factory`.
5. Append entries to `docs/development/harness-backlog.md` using
   [format-harness-backlog](assets/formats/format-harness-backlog-v1.0.0.example.md)
   in the delivery's final commit, and summarise them in the PR description.
6. Implementing an entry needs owner approval and is a direct-tier task.

## References

1. [format-harness-backlog](assets/formats/format-harness-backlog-v1.0.0.example.md)
2. Run by the foreman after `factory-accept` and before opening the PR.

## Skill layout

- `SKILL.md`: instructions.
- `assets/formats/format-harness-backlog-v1.0.0.example.md`: HARNESS_BACKLOG_V1 contract.

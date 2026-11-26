---
name: factory-deliver
description: "Deliver an agreed brief: direct tasks by the lead, full tasks by TDD workers in .trees, independent review, serial integration, cleanup and one PR."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory deliver

Deliver one committed brief using git and Copilot CLI. These are instructions, not
a runner; the only script is `scripts/worker.sh`. Do not create orchestration
scripts, scaffolding, side files or a new documentation hierarchy.

## Lead

1. Resume from actual git, `.trees/`, brief, issue, PR and CI state. Preserve dirty
   work. Confirm the brief and `AGENTS.md` are committed; worktrees see only commits.
2. Pick `ready` tasks whose dependencies are `integrated`, on the issue branch.
3. Direct tier: do the task yourself on the issue branch, with its docs, run its
   check and commit. No worker, no TDD, no per-task review.
4. Full tier: write `.trees/<task>.prompt.md` using
   [format-implementer-prompt](assets/formats/format-implementer-prompt-v1.0.0.example.md),
   then run `scripts/worker.sh start <task> <integration-head> <prompt>`. At most two.
   `scripts/worker.sh stop <task>` stops a worker and all its subprocesses.
   Record branch, base/head and PID in the task's `Worker` field.
5. When a worker exits, read its result and actual diff, then obtain fresh-context
   review through `factory-accept`. A successful exit is not acceptance.
6. Integrate passing, unchanged reviewed commits serially; run combined checks
   before unlocking dependants. Conflict fixes are new code needing review.
7. After integrating a task run `scripts/worker.sh clean <task>`: it removes the
   worktree, merged branch, pid and prompt, and keeps the log until the PR merges.
   Remove any file you created that is not part of the deliverable.
8. Draft the PR description using
   [format-pr-description](assets/formats/format-pr-description-v1.0.0.example.md),
   obtain final `factory-accept` on the combined SHA and that draft (this covers
   direct tasks), run `factory-harvest`, then open one PR. Post worker results,
   verdicts and harvest proposals as PR comments, not commits. Merge and release
   need the owner, whatever the change impact.

## Implementer

Read your prompt, `AGENTS.md`, the brief and `docs/architecture/decisions.md`.
Do not launch workers, merge, push, release or edit other worktrees. Observe one
failing test, implement the smallest coherent change, observe pass, refactor.
Update the ADR/component/docs pages listed in your task, plus their
`decisions.md` rows, in the same commit. Run the task checks, commit with the
configured identity, and reply with
[format-implementer-result](assets/formats/format-implementer-result-v1.0.0.example.md),
including `## Guesses`. Escalate material behaviour/contract/dependency changes.

## References

1. [format-implementer-prompt](assets/formats/format-implementer-prompt-v1.0.0.example.md)
2. [format-implementer-result](assets/formats/format-implementer-result-v1.0.0.example.md)
3. [format-pr-description](assets/formats/format-pr-description-v1.0.0.example.md)
4. Use `factory-design`, `factory-accept`, `factory-harvest`; return consequential
   discoveries to `factory-align`.

## Skill layout

- `SKILL.md`: lead and implementer instructions.
- `scripts/worker.sh`: start, stop or clean one worktree implementer (bash, no dependencies).
- `assets/formats/format-implementer-prompt-v1.0.0.example.md`: IMPLEMENTER_PROMPT_V1 contract.
- `assets/formats/format-implementer-result-v1.0.0.example.md`: IMPLEMENTER_RESULT_V1 contract.
- `assets/formats/format-pr-description-v1.0.0.example.md`: PR_DESCRIPTION_V1 contract.

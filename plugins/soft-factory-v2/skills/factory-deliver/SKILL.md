---
name: factory-deliver
description: "Resume an agreed delivery, run TDD workers in .trees, independently review, serially integrate and publish an accepted PR."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory deliver

Deliver one approved issue using native git and Copilot CLI facilities. These are
instructions, not a runner. Do not create orchestration scripts, scaffolding or a
new documentation hierarchy unless separately requested.

## Lead

1. Resume from actual git/issue/PR/CI and live worker state. Preserve dirty work.
   One lead owns the issue; another session must explicitly reconcile and take over.
   Verify agreed scope, commands, identity/signing and architecture before dispatch.
2. Select ready vertical tasks. Work in the existing devcontainer; create dedicated
   branches/worktrees under `.trees/` from the recorded integration head. Assign ACs,
   contracts, write scope, shared-file owner, runtime resources and checks.
3. Use separate `copilot --yolo -p` instances with a scoped prompt directing each to
   this skill's Implementer role. Start at most two independent implementers using
   existing background-process facilities. Worktrees and YOLO are not security isolation.
4. Record process/session identity, tree/branch, base/head, status and evidence in the
   existing work record. Inspect actual committed diffs and obtain fresh-context task
   review through `factory-accept`; a successful exit is not acceptance.
5. Integrate passing, unchanged reviewed commits serially into the issue branch;
   run current combined checks before unlocking dependants. Conflicts/fixes are new
   code needing checks and independent review. Failed tasks block dependants; broken
   integration stops dispatch until repaired.
6. Reconcile approved plan changes and clear affected reviews. Never duplicate a live
   worker or discard unfinished work. On interruption inspect surviving subprocesses,
   not only the CLI PID; stop only identified owned processes before redispatch.
   Do not leave detached services running. Remove only completed clean worktrees.
7. Obtain independent final acceptance of the exact combined SHA with current full
   checks. Preserve evidence in the existing work record/PR. Open/update one PR; merge
   and release require explicit delegated policy. Report outcome and at most one
   needed owner action. Do not claim the real-product pilot is complete from skill loading.

## Implementer

Read your scoped task, design and relevant project instructions. Do not launch workers,
merge, push, release or edit other worktrees. For suitable behaviour changes: observe
one intended failing test, implement the smallest coherent change, observe pass, then
refactor. Prefer meaningful integration tests; justify unsuitable TDD cases.

Update affected tests/docs and observability within scope, run relevant real checks,
commit with configured identity/signing, and return SHA, files, actual commands/results,
AC evidence and unresolved decisions. Escalate material behaviour/contract/dependency
changes; routine internal details are delegated. Do not self-certify acceptance.

## References

Use `soft-factory-v2:factory-design`, `soft-factory-v2:factory-accept` and, for
consequential discoveries, `soft-factory-v2:factory-align`.

## Skill layout

- `SKILL.md`: self-contained lead and implementer instructions.

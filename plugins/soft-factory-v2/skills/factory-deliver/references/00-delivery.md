# Deliver an agreed issue

## Lead responsibilities and resume

You MUST begin from an approved scope/go and canonical work brief. A question does
not authorise changes. You MUST reconcile git branch/head, dirty state, issue/PR/CI,
active worker processes and last acceptance evidence before acting. Chat summaries
are supporting context, not current authority. Exactly one lead owns this delivery.

You MUST work in the existing Linux devcontainer; workers share it. You MUST NOT provision
per-worker containers or claim worktrees isolate credentials/processes. Use `.trees/`
for workers, with separate ports/databases/generated outputs when required.
You MUST verify actual identity/signing, tools and project checks through onboarding.
Secrets and private transcript data MUST NOT appear in reports, tracked config or logs.

Use `soft-factory-v2:factory-design` throughout. You MUST retain ownership of meaningful
commitments and escalate consequential deviations through `factory-align`. Routine
internal choices are delegated. Shared-file changes have exactly one owner.

## TDD and worker contract

An implementer MUST read the assigned context/brief, relevant standards and design.
For testable behaviour/regressions, observe one intended failing test, implement the
smallest coherent fix, observe pass, then refactor. Record lightweight red/green
evidence in checks; passing final tests alone do not prove TDD. Justified exceptions
MUST explain unsuitable work such as documentation-only changes.

You MUST prefer high-value integration/system tests and public-interface behaviour,
not thousands of trivial unit tests. Unit tests MAY add distinct confidence for
complex isolated logic. Update affected docs and proportionate observability.
Run focused real checks; verify the actual requirement, not a proxy.

Implementers MUST commit only their assigned scope, preserve configured signing,
identity/trailers and return evidence. They MUST NOT launch more workers, modify the
ledger/other worktrees, merge, push or release. These are role constraints, not a
hard security boundary in a shared `--yolo` environment.

## Execution snapshot and helper

Resolve `scripts/worktrees.mjs` from this loaded skill's base directory; do not guess
an installation path or assume plugin-root shell substitution. The helper needs
Node.js 20+, git, Copilot CLI and the actual project checks. It loads the same local
plugin into independent `copilot --yolo -p` processes.

Set `FACTORY_LEAD_ID` to the unique lead/session handle. Export a local plan from the
approved brief, for example `.trees/plan.json` in the locally excluded execution directory:

```json
{
  "combinedCheck": ["just", "verify-focused"],
  "tasks": [
    {
      "id": "T1",
      "acs": ["AC-1"],
      "dependsOn": [],
      "paths": ["src/orders/", "tests/orders.test.ts"],
      "instructions": "Implement the agreed first order outcome; use the brief's contract, TDD, tests and docs."
    }
  ]
}
```

Paths are exact files or directory prefixes ending in `/`; root, `.git`, `.trees`,
absolute paths and `..` are forbidden. Capture runtime-resource assignments and
relevant contract/check details in instructions. Tasks MUST cover the brief's stable
AC IDs. The helper rejects unknown prerequisites and cycles. The snapshot is local
execution state, not a second authoritative design document.

From the feature integration checkout, use the absolute helper path:

```sh
export FACTORY_LEAD_ID="unique-lead-session"
node /absolute/skill/path/scripts/worktrees.mjs init 123 docs/work/123-orders/work.md /absolute/plan.json
node /absolute/skill/path/scripts/worktrees.mjs status
node /absolute/skill/path/scripts/worktrees.mjs run T1
node /absolute/skill/path/scripts/worktrees.mjs review T1
node /absolute/skill/path/scripts/worktrees.mjs integrate T1
node /absolute/skill/path/scripts/worktrees.mjs accept
```

`init` requires a clean feature checkout and preserves existing state. It excludes
`.trees/` locally without replacing repo ignores. `run` and `review` are foreground
commands until their separate worker exits. The lead MAY start two independent `run`
commands through the CLI background-command facility and continue other useful work.
The helper caps implementers at two and rejects active overlapping write scopes.
You MUST NOT force parallelism or detach services just to wait for bounded work.
The helper awaits a private worker process group; it is not an independent service.
Workers MUST NOT daemonise/detach subprocesses. Cancellation signals the known group,
allows graceful exit, then terminates remaining inheriting processes. Live remnants
retain a `stopping`/busy gate until inspected and recovered, never silently redispatched.

## Evidence and integration

Workers write the assigned JSON report outside tracked application files:

```json
{
  "sha": "actual committed implementation SHA",
  "checks": [{ "command": "actual command", "exitCode": 0, "summary": "observed failure/pass and evidence" }],
  "acEvidence": [{ "id": "AC-1", "status": "met", "evidence": "concrete result" }],
  "decisions": []
}
```

Unresolved consequential decisions MUST be reported instead of hidden. The helper
blocks reports with unresolved decisions; the lead MUST settle them through alignment
and reconcile implementation/report evidence before retrying. A successful process
exit is not acceptance. The helper checks actual commits, clean trees, scope and
report coverage; it cannot certify the truth of reported commands or hard-enforce roles.

`review T1` starts a fresh `factory-accept` context. It checks the actual task SHA,
design/standards and evidence. `integrate T1` requires a passing review of the unchanged
head, serially merges its branch with `--no-ff`, and runs the approved combined check.
A prerequisite unlocks only after that integration passes. A failed task blocks its
dependants, not unrelated ready work. Broken/busy integration blocks all new dispatch.

For final acceptance, all tasks MUST be integrated. `accept` starts a separate final
review context and runs both the current approved combined check and `just verify`
(once when they are identical); an exact-SHA passing verdict is required. Updating
a validation command invalidates earlier acceptance even if implementation is unchanged.
Final review focuses on combined effects/ACs and relevant reruns, not mandatory
duplicate line-by-line review of unchanged task code. Changed integration code MUST
receive independent review. Any later implementation commit/dirty state invalidates
the accepted head. Subjective/unavailable ACs remain blocked until actual owner evidence
or prerequisites resolve; do not weaken them to produce a pass.

## Recovery and handoff

Inspect `status` and local `.trees/results/` context/report/log files before retrying.
The ledger records owner, base/head SHAs, tasks, live PIDs and plugin/helper provenance.
You MUST NOT relaunch a live worker or assume a lost session means it stopped.
Recorded process-group liveness includes surviving inheriting descendants, not only
the CLI PID. Escaped/daemonised processes are outside this coordination model and
are forbidden by the worker contract; this is not a hard security sandbox.

| Command | Use |
|---|---|
| `recover T1` | Mark an interrupted task blocked only when recorded helper/worker PIDs are dead; preserve its tree. |
| `recover-integration` | Clear dead integration/final-review job bookkeeping and retain the blocked gate. |
| `recover-lock` | Remove a known ledger lock only after its recorded process is dead. |
| `repair` | Independently review a clean committed integration/conflict fix and rerun combined checks before clearing the gate. |
| `update-plan /absolute/plan.json` | Reconcile an approved revised snapshot while no workers run; preserve history and clear affected reviews. |
| `handoff new-lead-id` | Explicitly transfer ownership with the current lead ID after live jobs finish/recover. |
| `cleanup T1` | Remove only an integrated clean worktree; preserve reports and branch history. |
| `archive` | Retain completed ledger/results under `.trees/history/` after acceptance and cleanup, allowing another issue to initialise. |

Conflict resolution is new code: the lead MUST resolve and commit it, then `repair`
reviews changes from the last known-good integration SHA. Never force-delete unfinished
work, bypass checks or blindly overwrite a live lock. PID liveness is conservative:
uncertain/reused PIDs require inspection, not automatic termination.
After two unsuccessful corrections of the same finding, request the owner's decision.
The helper does not autonomously retry or decide the resolution.

Material plan changes MUST pause affected work, return through alignment, and reconcile
the approved brief/snapshot and preserved work before continuing. Do not let workers
edit the execution ledger to reinterpret their assignments.
Use `update-plan` after agreement and clean integration state; a changed integration
head first requires repair review. Existing task history cannot be silently removed,
and integrated definitions cannot be rewritten; add explicit correction tasks instead.
Changed unfinished assignments retain their worktree and lose prior review approval.

After PR evidence is saved, clean integrated worktrees and archive the local delivery.
Archive permits subsequent changes only to the canonical work brief, not application
changes after acceptance; all other changes need renewed review. Reports/logs remain
local history and MUST be sanitised or protected according to project policy.

## PR and operator handoff

After independent acceptance, the lead MUST record the implementation SHA and evidence
in the work record/PR, distinguish metadata-only publication commits from implementation
changes, and open/update the issue's PR. The helper never publishes or releases.
Merge/release need explicit delegated project policy. Check relevant CI, trusted-base
risk, signing, docs, negative checks, visuals and local/deployed limitations.

Report outcome, verified SHA/PR, release state and at most one needed owner action in
plain language. After an authorised merge, inspect CI on main. Do not move published
tags implicitly. Keep important cross-channel handoffs discoverable without relying
on a single previous session.

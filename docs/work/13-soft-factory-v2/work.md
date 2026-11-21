# Issue 13: Soft Factory v2 delivery plugin

Issue: https://github.com/jsburckhardt/toolio/issues/13
Branch: `feat/soft-factory-v2`. Status: ready for independent review.

## Scope and decisions

Implement the agreed v2 in toolio on the owner's 2026-11-21 go. One opt-in plugin;
preserve v1. Existing shared devcontainer, `.trees/` worktrees, initially two workers,
independent task/final review and serial integration. One canonical work brief and
proportionate architecture records. Approved bounded spikes, integration-first TDD,
autonomy through PR only. No plugin installation, merge, release, collector or aimigo build.

The owner approved meaningful commitments in the prior grilling. Routine helper and
file choices are delegated. Node built-ins and a separate plugin are recorded in the
[ADR](../../architecture/adrs/ADR-20261121-skill-based-delivery.md).

## Acceptance and evidence plan

| AC | Outcome | Check |
|---|---|---|
| AC-1 | Discoverable opt-in plugin; v1 unchanged | Manifest/README checks, CLI local discovery, git diff of v1 paths |
| AC-2 | Skills encode the agreed delivery/design/spike/authority contract | Reference/link validation and independent review |
| AC-3 | Bounded process/worktree lifecycle with exact review and integration gates | Real-git integration fixtures |
| AC-4 | Parallelism, staleness, failures and recovery preserve work | Focused lifecycle integration cases |
| AC-5 | Actual checks/discovery pass; pilot limitations explicit | `just verify`, CLI discovery, independent review and PR evidence |

## Design and tasks

T1: Add opt-in plugin and seven skills, following existing APS skill-entry structure.
T2: Add the minimal foreground lifecycle helper and integration tests. It uses native
git/Copilot and a local ledger; it is not a workflow engine or security sandbox.
T3: Register/document the plugin, add real validation and review/publish the change.
T3 depends on T1/T2. This implementation is handled by one lead; parallelism is a
capability to demonstrate in fixtures and the later pilot, not forced on this issue.

## TDD and current evidence

- Initial integration test failed because the worktree helper did not exist.
- `just doctor`: repository-local identity/signing configuration and required local tools checked.
- `just verify`: marketplace/skill/link validation, Node syntax and eight integration
  scenarios pass, including concurrent workers, scope/capacity/ownership, stale review,
  integration check failure, changed heads, interrupted work, real merge conflicts,
  snapshot revision and completed-delivery archival.
- `copilot --plugin-dir <v2> skill list`: all seven plugin skills discovered without installation.
- A read-only `copilot --plugin-dir <v2> --deny-tool shell --deny-tool write -p ...`
  invoked `soft-factory-v2:factory-design`, read its reference and returned its rules.
- V1 plugin paths have no diff. No npm packages were installed.
- Independent verdict and exact reviewed implementation SHA will be recorded before PR.

## Environment and limitations

Host checkout initially inherited another identity; configure repository-local
`jsburckhardt` identity and the existing SSH agent key before committing.
Node 22, git, just and Copilot CLI are available; no npm packages are required.
The current CLI environment is not asserted to be the project's devcontainer. Tests
run as bounded local tooling; consumer workers use their existing devcontainer.
V2 adds a Node devcontainer feature for repeatable tooling but does not provision
per-worker environments.

Controlled worker fixtures cannot establish live model behaviour, hard isolation,
Pocket credentials/API semantics, aimigo UX or marketplace exact version locks.
The owner's candidate pilot is a config-driven single-binary Go/Rust Pocket collector
in a separate repo; aimigo wiki/graph/tunnel UI is later work. Full scaffolding and
standalone architecture scans are deferred.

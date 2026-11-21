# ADR: Opt-in skill-based delivery with bounded worktree helpers

Status: Accepted for issue #13. Date: 2026-11-21.

## Context

The owner agreed the v2 design through a grilling session on 2026-11-17. Toolio already
publishes independent v1 skills/agents plugins. Replacing them silently would break
existing delivery expectations. Skills describe procedures but do not provide process
recovery, git isolation, concurrency enforcement or independent judgment themselves.

## Decision

Publish an opt-in `soft-factory-v2` plugin with seven reusable skills and no dedicated
stage-agent definitions. Keep v1 unchanged. The lead owns one issue/integration branch/PR;
separate implementer and acceptance CLI contexts supply execution and independent review.
Workers share the existing devcontainer and use `.trees/` worktrees, not per-worker containers.

Use a small foreground Node.js helper for dispatch/state, exact-SHA/scope checks, serial
integration and recovery. It caps implementers at two and never publishes. Node.js 20+
built-ins suffice: zero added npm dependencies. Existing CLI fleet orchestration does
not itself establish this separate-process worktree contract. Avoid a daemon or workflow
engine. Native git remains the integration mechanism.

Keep decisions/ACs/design/evidence in a canonical work brief, with proportionate ADRs
and component contracts. Approved spikes have bounds and structured output under
`docs/spikes/`. Prefer meaningful integration tests over test counts and observed TDD
for suitable changes. Final acceptance is independent, exact-SHA and integration-focused.

## Alternatives and consequences

- Replacing v1: rejected because the owner requires opt-in migration.
- Agent per stage: rejected; responsibilities do not require separate named agents.
- In-session fleet only: insufficient for this explicitly chosen independent CLI/worktree model.
- General scheduler/per-worker container platform: rejected as unnecessary scope.
- Prompts alone for lifecycle: insufficient to detect concurrent work and stale commits reliably.

Reports and lead tokens are coordination contracts, not security guarantees or proof
that an AI told the truth. Shared YOLO workers see the shared environment. Independent
review and actual checks remain necessary. Marketplace version strings do not prove
exact pinning; deliberate upgrade/revision evidence is required without unsupported claims.

## Facts and revisit triggers

- Toolio's existing plugin/marketplace structure: `.github/plugin/marketplace.json`.
- Copilot CLI build documentation: `-p` exits after completion; `--yolo` grants all
  permissions; `--plugin-dir` loads a local plugin; repository `enabledPlugins` shares plugins.
- The checked repository has no existing root automated test runner; v2 introduces
  Node built-in integration tests with real git and a controlled worker fixture.

Revisit if native CLI worktree lifecycle/reproducible plugin pinning replaces these
helpers, concurrency evidence justifies a higher cap, or the trust model requires
harder execution isolation. Real Pocket collector/aimigo delivery remains a later pilot.

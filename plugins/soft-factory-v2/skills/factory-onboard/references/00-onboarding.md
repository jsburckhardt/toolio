# Onboard an existing repository

## Discover, do not guess

You MUST inspect AGENTS.md, actual source/tests, architecture, git state, project
commands and CI. You MUST preserve dirty user work. You MUST distinguish a question
from approval to change the repository. You MUST NOT rewrite the application or
silently replace v1 instructions.

You MUST check repository-local identity/signing and public verification expectations
before the first commit. You MUST NOT inherit a shared host's identity without checking.
You MUST discover runtime/configuration and local-versus-deployed differences. Missing
credentials or cloud-only capabilities MUST remain prerequisites, not fictitious passes.

## Project contract

You MUST establish a `just` interface over existing tools after approval:

| Recipe | Actual work |
|---|---|
| `doctor` | Check identity/signing, git state, required tools and environment readiness. |
| `verify-focused` | Run selected relevant tests and lint/format/type checks. |
| `verify` | Run real application checks/builds, not just whitespace inspection. |
| `risk` | Evaluate the change against project policy from a trusted base. |

You MUST provide image builds, E2E checks and screenshots when the project/change
needs them. You MUST NOT add no-op recipes just to satisfy this table. CI MUST run
applicable actual checks, including shipped images affected by dependency updates.
You SHOULD reuse existing commands and describe uncovered checks honestly.

The existing devcontainer is the environment; you MUST NOT repeatedly request
container-entry steps or require a separate container per worker. You MUST verify
Node.js 20+, git, Copilot and just availability, `.trees/` git metadata visibility,
and separation of task-specific runtime resources. Worktrees MUST be excluded from
tracked content and ordinary source discovery. You MUST NOT claim hard worker isolation.

## Cold-start map and authority

You SHOULD keep AGENTS.md short: commands, project map, applicable invariants and
policy. You MUST keep secrets outside tracked config, briefs, reports and logs.
You MUST preserve approved storage/configuration/telemetry rules.
You SHOULD merge repository plugin enablement rather than copy shared skills or
overwrite existing settings. You MUST record actual plugin provenance without
claiming unsupported exact version pinning.

You MUST record merge/release delegation, subjective sign-offs and external access
prerequisites. Without an explicit policy, delivery ends at a PR. You MUST NOT
derive release permission from merge permission.

You MUST propose consequential missing capabilities before implementing them.
Full new-project scaffolding is outside this skill. Return findings, actual commands,
prerequisites, recommended changes and the next delivery step in plain language.

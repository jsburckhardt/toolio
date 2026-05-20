> ⚠️  **PIVOT NOTE — 2026-05-20**
>
> The deliverable in this PR was originally framed as an installable Copilot CLI
> extension built with `@github/copilot-sdk`, with a POSIX-bash offline
> entrypoint as the canonical implementation. After implementation and review,
> user feedback established that the artifact was a *tool*, not a *workshop* —
> it taught nothing.
>
> The final deliverable is a **self-contained static website** under
> `workshops/sdd-evolution-harness-engineering/site/`. Nine module pages cover
> the same SDD-evolution arc with concept narrative, exercises,
> expected-output callouts, and debrief questions.
>
> The document below is preserved as the historical record of how the decision
> was reached. The *content* (RPIV, ADRs, brownfield, 2×2, parallel agents) is
> unchanged; only the *delivery format* changed. For the current state, see
> `workshops/sdd-evolution-harness-engineering/site/index.html`.

---

# Action Plan: SDD-Evolution Harness Workshop

## Feature
- **ID:** 4
- **Title:** feat(workshop): SDD-evolution harness workshop — interactive, scaffolded with @github/copilot-sdk
- **Research Brief:** `project/issues/4/research/00-research.md`

## Chosen Approach

Build the workshop as a Copilot CLI extension package at
`workshops/sdd-evolution-harness-engineering/extension/`, but make the **bash entrypoint
`extension/bin/workshop` the canonical implementation** and layer the SDK adapter on top.
This is the research brief's "Interpretation B" / "recommended default position" and is
mandated by ADR-0004 §Cross-layout rule #3 + #4. Concretely:

1. **Bash-first.** The state machine, `flock`-based locking, drift detection, hook chaining,
   computational sensors, scaffolders, and 2×2 inspector are all implemented in POSIX shell
   under `extension/bin/workshop` + `extension/lib/`. Every command works without Node.js or
   the SDK.
2. **SDK adapter is a thin shim.** `@github/copilot-sdk` is consumed as a Node.js library and
   added on top via `extension/commands/*.ts`. Each TypeScript command delegates to the bash
   entrypoint via subprocess so behaviour is identical online and offline; SDK-only features
   (inferential coaches, agent-driven scaffolders) print a degraded-mode banner and exit
   gracefully when the SDK is unavailable.
3. **Pinned Node.js.** Node.js LTS is floating in the devcontainer; the Implementer pins the
   exact tested version (`node --version` at implementation time) in
   `scaffold-with-copilot-sdk.md` and asserts a minimum in `extension/bin/workshop`.
4. **`flock` is required, not optional.** The bash entrypoint hard-fails with a clear message
   if `flock` is absent (LOW-MEDIUM risk #6).
5. **Layout B per ADR-0004.** Directory shape follows the ADR exactly:
   `workshop.json`, `README.md`, `scaffold-with-copilot-sdk.md`, `extension/{manifest.json,
   bin/, commands/, hooks/, lib/}`, `modules/00-baseline.md` … `08-closing-kata.md`,
   `test-fixtures/brownfield/`.
6. **Drafts never auto-apply.** `workshop scaffold *` and `workshop onboard` write to
   `pendingScaffoldDrafts` in the state file and a drafts directory inside the workshop's
   own runtime path; only `workshop accept-draft <id>` mutates canonical paths
   (`DECISION-LOG.md`, ADR files, etc.), and never auto-commits.
7. **Brownfield fixture is committed.** The fixture matches the structure in the research
   brief §Brownfield Test Fixture Recommendation so onboard tests are deterministic.

## Non-Goals

This issue does **NOT** deliver:

- A second harness workshop (CORE-COMPONENT-0003 deferred until a second one is proposed).
- Formal adoption of `@github/copilot-sdk` as the project-wide SDK; only this workshop's
  adapter uses it, behind a version-pinned thin wrapper.
- Markdown link-checking in CI (explicit AC: "markdown link checking is a manual step").
- Amendments to `schemas/workshop.schema.json` (no new top-level fields).
- A repo-root install convention for Copilot CLI plugins (ADR-0005 deferred — see below).
- macOS-without-flock support (LOW-MEDIUM risk #6; devcontainer-scoped).
- Auto-acceptance of any scaffolded ADR/core-component draft; the trainee explicitly accepts.

## Decisions Made by This Plan Stage

| Decision | Source | DECISION-LOG entry |
|----------|--------|--------------------|
| Permit two workshop layouts (Layout A `steps/`; Layout B `extension/`+`modules/`) | ADR-0004 | #18 |
| Require offline bash entrypoint `extension/bin/workshop` for every interactive workshop | ADR-0004 | #19 |
| Prohibit workshop extensions from writing outside `workshops/<slug>/` | ADR-0004 | #20 |
| Prohibit adding a `layout` field to `workshop.json` | ADR-0004 | #21 |
| Require `workshops/README.md` to document both layouts side-by-side | ADR-0004 | #22 |
| Defer ADR-0005 (Copilot CLI plugin install convention) | ADR-0004 §Disposition | #23 |
| Defer CORE-COMPONENT-0003 (Workshop Harness Pattern) | ADR-0004 §Disposition | #24 |

## ADRs Created
- [ADR-0004 — Extension-Driven Workshop Layout Standard](../../../architecture/ADR/ADR-0004-extension-driven-workshop-layout.md)

## Core-Components Created
- _None._ CORE-COMPONENT-0003 (Workshop Harness Pattern) is **deferred** until a second
  harness workshop is proposed. The pattern is documented in-workshop in
  `scaffold-with-copilot-sdk.md` so a future promotion has source material.

## Pre-Plan Verification Results

The planning environment does not expose a shell tool, so the verifications below were
performed via prior research-stage evidence + repository inspection rather than live shell:

| Check | Source | Result | Implication |
|-------|--------|--------|-------------|
| `copilot /plugin install` exists | Research brief §`/plugin install` Mechanism — CRITICAL GAP (lines 206–245) | **Unverified at plan time; treated as not-yet-public.** | Adopt research brief's recommended default: bash entrypoint is canonical; ADR-0005 deferred. Implementer reruns `copilot --help` and `copilot /plugin --help` in the devcontainer at task 0 (see task 0 in the breakdown) and, if `/plugin install` exists *and* writes outside `workshops/<slug>/`, escalates back to the Plan stage. |
| `which flock` | Devcontainer base is `mcr.microsoft.com/devcontainers/base:ubuntu`; `flock` is part of `util-linux` (research brief §6, line 150) | **Expected present.** | Bash entrypoint hard-fails on `command -v flock` returning empty; clear message names `flock` as the missing capability. |
| `which node`, `which jq`, `which check-jsonschema` | Devcontainer features + CI workflow (research brief §6, lines 138–145) | **Present.** | No new system deps. |
| `node --version` | Floating LTS (research brief §6, line 142 and §Tech-Stack Confirmation) | **Floating; pin at Implement time.** | Implementer captures the exact version and records it in `scaffold-with-copilot-sdk.md` and an explicit minimum-version check in `extension/bin/workshop`. Acceptance test asserts the pinned line is present. |
| `npm view @github/copilot-sdk version` | Research brief §SDK Version Requirement (line 263) | **Pinned at Implement time.** | Recorded in `scaffold-with-copilot-sdk.md`. |

**Net effect on architecture:** ADR-0005 is not created. If the implementer's live
`copilot /plugin --help` returns a real install command that introduces a repo-root file
(e.g., `.copilot/plugins.json` at the repo root), they MUST stop and return to the Plan
stage to open ADR-0005 (per AGENTS.md guardrail "must return to the Plan stage if
implementation diverges from an ADR").

## Summary of Acceptance Criteria

Counts derived directly from `gh issue view 4` acceptance markers as captured in the research
brief lines 298–484:

| Group | AC Count |
|-------|---------|
| Core — the interactive harness | 19 |
| Core — state, worktrees, concurrency | 4 |
| Core — repo compliance (light touch) | 6 |
| Edge Cases | 13 |
| Testing — the harness has tests, not just hopes | 14 |
| **Total** | **56** |

Every AC is mapped to at least one task in `02-task-breakdown.md`. Test coverage for each AC
is specified in `03-test-plan.md`.

## Implementation Tasks (ordered by dependency)

The full breakdown lives in `02-task-breakdown.md`. Ordering is:

0. **T00** — Implementer environment verification (`copilot /plugin --help`, `flock`, `node`, `npm view`)
1. **T01** — Workshop manifest + ADR-0004-compliant directory skeleton + `LLM.txt` entry
2. **T02** — `extension/bin/workshop` bash entrypoint: command dispatch, `--help`/`--json`, `NO_COLOR`/`TERM=dumb`, degraded-mode banner
3. **T03** — State machine + `flock` locking + drift detection (six triggers)
4. **T04** — Hook installer + chaining + backup + `reset` + `override` ledger
5. **T05** — Computational sensors (`pre-commit-research-gate`, `pre-commit-plan-gate`, `pre-pr-verify-gate`) as installable hooks
6. **T06** — Modules `00-baseline.md` … `08-closing-kata.md` action sheets (≤ ~80 lines each)
7. **T07** — Scaffolders (`scaffold plan|research|verify|adr|core-component|guide|sensor`) + `pendingScaffoldDrafts` + `accept-draft`/`reject-draft`
8. **T08** — Inferential coaches as prompt files + `workshop coach <topic>` dispatcher with degraded-mode banner
9. **T09** — 2×2 inspector `workshop diagnose 2x2` (with `--json`)
10. **T10** — Brownfield onboarding `workshop onboard <path>` + security guards + reference fixture + secret redaction
11. **T11** — Stretch deliverables: Module 5 `install-promote-ephemeral`, Module 6 quadrant fillers, Module 7 `fan-out`
12. **T12** — SDK adapter (`extension/commands/*.ts`) + `extension/manifest.json` + `scaffold-with-copilot-sdk.md` with pinned SDK and Node versions
13. **T13** — Workshop `README.md` with minute-by-minute 90-minute condensed agenda + attribution + MIT confirmation
14. **T14** — Catalogue updates: `workshops/README.md` Layout-A/Layout-B documentation + Advanced table entry
15. **T15** — Registry regeneration via `scripts/rebuild-registry.sh` and commit
16. **T16** — Test fixtures + integration test suite (per `03-test-plan.md`)

T02 → T03 → T04/T05 → T06/T07 → T08/T09/T10 → T11 → T12 → T13/T14 → T15 → T16. T16 is
incremental: each functional task contributes tests as it ships, and T16 is the dedicated
slot for hook-chaining-fixture, brownfield, concurrency, and offline integration tests.

## Open Questions Deferred to Implement

None are architectural. The following are deliberately deferred to the Implementer:

1. **Pinned Node.js version string** — determined by `node --version` at implementation time.
2. **Pinned `@github/copilot-sdk` version string** — determined by `npm view @github/copilot-sdk version`.
3. **Exact wording of the degraded-mode banner** — must satisfy AC ("inferential coaches
   disabled — running in degraded mode") and `NO_COLOR` compliance; phrasing within those
   constraints is the Implementer's call.
4. **Exact set of secret-redaction regexes** for `workshop onboard` — minimum: GitHub PAT
   (`ghp_…`), AWS keys (`AKIA[0-9A-Z]{16}`), generic 32+ char hex/base64 entropy thresholds.
   Implementer adds more if the brownfield fixture exposes additional categories.
5. **Module body prose** beyond the action-sheet skeleton — issue Appendix A is the source of
   truth for narrative; modules cite it.
6. **Drift-trigger heuristics** for `git rebase` and `gh pr merge` — research brief §Risk #3
   suggests `git merge-base --is-ancestor` and `git branch --contains`; Implementer chooses
   final shell idioms.

If any deferred item turns out to require an architectural decision (e.g.,
`copilot /plugin install` mandates a repo-root file), the Implementer returns to the Plan
stage per AGENTS.md.
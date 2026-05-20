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

# Task Breakdown — Issue #4

> AC references use the group labels from the issue body / research brief §Acceptance Criteria:
> **CH** = Core/harness, **CS** = Core/state-worktrees-concurrency, **CR** = Core/repo-compliance,
> **EC** = Edge Cases, **TT** = Testing. Indices follow the order they appear in the issue body.
> Every task lists Related ADRs/CCs; if "none" applies, it is stated explicitly.

---

## Task T00: Implementer environment verification

- **Status:** Pending
- **Complexity:** XS
- **Dependencies:** None
- **Related ADRs:** ADR-0004
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Before writing code, run the verifications the Plan stage could not run live:
`copilot --help`, `copilot /plugin --help`, `which flock`, `which node`, `node --version`,
`npm view @github/copilot-sdk version`. Record results in
`project/issues/4/implementation/README.md`. If `copilot /plugin install` exists *and*
would write outside `workshops/sdd-evolution-harness-engineering/extension/`, STOP and
return to the Plan stage to open ADR-0005.

### Acceptance Criteria
- `project/issues/4/implementation/README.md` records the exact output (or trimmed first 30 lines) of each command listed above.
- Node.js and `@github/copilot-sdk` versions are captured for use in T12.
- If `/plugin install` introduces a repo-root path, work pauses and Plan stage is re-entered.

### Test Coverage
- Manual evidence: the file exists and is committed in T15.

---

## Task T01: Workshop manifest, ADR-0004 directory skeleton, LLM.txt entry

- **Status:** Pending
- **Complexity:** S
- **Dependencies:** T00
- **Related ADRs:** ADR-0002, ADR-0003, ADR-0004
- **Related Core-Components:** None

### Description
Create `workshops/sdd-evolution-harness-engineering/` with `workshop.json`, an empty
`README.md` stub, `scaffold-with-copilot-sdk.md` stub, and the Layout-B subdirectory
skeleton: `extension/{bin,commands,hooks,lib}/`, `modules/`, `test-fixtures/brownfield/`.
Add a single-line entry to `LLM.txt`.

### Acceptance Criteria
- **CR-1**: `workshop.json` validates against `schemas/workshop.schema.json`
  (`difficulty: "advanced"`, `estimatedDuration: "3h15m"`, `version: "1.0.0"`,
  slug `sdd-evolution-harness-engineering`).
- **CR-5**: `LLM.txt` gains exactly one line for the new workshop.
- **CR-6**: No new top-level field is added to `workshop.json`; no new repo-root convention.
- Directory layout matches ADR-0004 Layout B (`extension/`, `modules/`, `test-fixtures/`,
  `scaffold-with-copilot-sdk.md`, `workshop.json`, `README.md`).

### Test Coverage
- Schema test: `check-jsonschema --schemafile schemas/workshop.schema.json workshops/sdd-evolution-harness-engineering/workshop.json` exits 0 (TT-Schema, see test plan T-SCHEMA-01).
- Layout test: existence of all ADR-0004-required directories asserted by T-LAYOUT-01.
- Lint: no `.workshop-state.json` reference in committed files (state file is runtime-only).

---

## Task T02: `extension/bin/workshop` bash entrypoint + command dispatch

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T01
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement the POSIX-bash entrypoint that dispatches every command in the Canonical Command
Inventory (§2.1) to subfunctions or sourced lib files. Implement `workshop help`, `--help`
on every subcommand, `--json` on `help`/`status`/`verify`/`diagnose`, `NO_COLOR` /
`TERM=dumb` compliance, missing-`flock` hard-fail with named capability, degraded-mode
banner when the SDK is unavailable. Stub commands print "not yet implemented" with exit 2
so subsequent tasks fill them in.

### Acceptance Criteria
- **CH-2**: every command listed (`start`, `install-hooks`, `next`, `status`, `verify`,
  `coach`, `diagnose`, `reset`, `run`, `debrief`, `scaffold`, `override`, `reconcile`,
  `onboard`, `install-promote-ephemeral`, `fan-out`, `accept-draft`, `reject-draft`) is
  reachable via dispatch (stubs OK at this task).
- **CH-3**: `workshop help` lists every command; `workshop help --json` emits machine output.
- **CH-5**: all commands namespaced under `workshop`.
- **EC-1**: bash fallback exists and is executable.
- **EC-2**: degraded-mode banner present when SDK unavailable.
- **EC-3**: unsupported-offline commands exit non-zero naming the missing capability.
- **EC-10**: `NO_COLOR=1` and `TERM=dumb` produce zero ANSI escapes.
- **EC-11**: `--json` works on `help`, `status`, `verify`, `diagnose`.

### Test Coverage
- T-DISPATCH-01: `workshop help` lists every required command.
- T-DISPATCH-02: `workshop help --json` is valid JSON.
- T-NOCOLOR-01: `NO_COLOR=1 workshop help` output contains no `\x1b[` escapes.
- T-OFFLINE-BANNER-01: when `WORKSHOP_FORCE_OFFLINE=1`, a degraded banner appears on stderr.
- T-FLOCK-MISSING-01: with `flock` shadowed by an empty PATH stub, `workshop start` exits non-zero with "flock" in stderr.

---

## Task T03: State machine, `flock` locking, drift detection

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** T02
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement `<repo-root>/.workshop-state.json` persistence (paths + SHAs only, no file
contents), per-`git-common-dir` `flock`, read-only commands skipping the lock, drift
detection against the six triggers (`git reset --hard`, `git rebase`,
`git checkout <other-branch>`, `git worktree remove`, `git worktree add`,
branch-deleted-after-PR-merge), and `workshop reconcile`.

### Acceptance Criteria
- **CS-1**: state file at `<repo-root>/.workshop-state.json` persists
  `gitCommonDir`, `worktreePath`, `branch`, `headSha`, `currentModule`, `invariantsMet`,
  `installedHooks` (incl. backup paths), `overrideLedger`, `pendingScaffoldDrafts`.
- **CS-2**: state-mutating commands hold a per-`git-common-dir` `flock`; read-only commands
  (`status`, `verify --dry-run`, `diagnose`) do not block.
- **CS-3**: `workshop status` detects all six drift triggers and offers `workshop reconcile`.
- **CS-4**: two clones run simultaneously without state collision.
- **EC-13**: state file never contains repo file contents (paths + SHAs only) and
  `.workshop-state.json` is added to `.gitignore` by `workshop start` if absent.

### Test Coverage
- T-STATE-01: state file shape matches the documented keys.
- T-DRIFT-{reset, rebase, checkout, worktree-remove, worktree-add, pr-merge}-01: each trigger flips status to "drift detected" with non-zero exit on `verify`.
- T-CONCURRENCY-01: two clones each call `workshop start` simultaneously; both succeed, each with their own state file.
- T-NO-FILE-CONTENTS-01: grep state file → contains no payload of any non-state file.

---

## Task T04: Hook installer, chaining, backup, `reset`, `override` ledger

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** T03
- **Related ADRs:** ADR-0004
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Implement `workshop install-hooks` with detection for Husky (`.husky/`), pre-commit.com
(`.pre-commit-config.yaml`), and raw `.git/hooks/<name>`; chain after the existing chain;
back the prior file up to `.git/hooks/<name>.workshop-backup.<unix-ts>`; self-identify on
line 1. Implement `workshop override --reason "<text>"` (one-commit bypass + ledger entry
visible via `workshop status`; next commit re-gated). Implement `workshop reset` (idempotent
cleanup that restores backups, deletes state file, prints removed paths).

### Acceptance Criteria
- **CH-8**: install-hooks detects existing frameworks, chains, backs up; never replaces.
- **CH-9**: at least three sensors install as hooks (delivered in T05; this task wires the installer).
- **CH-13**: `workshop override --reason "<text>"` documents-and-bypasses for one commit; ledger visible in `status`; next commit re-gated.
- **CH-14**: `workshop reset` removes all workshop-installed hooks, restores backups, deletes state file, prints removed paths, idempotent.
- **EC-4**: idempotent reset → exit 0 second run.
- **EC-5**: hooks self-identify on line 1.
- **EC-7**: uninstall via `copilot /plugin uninstall` (or the equivalent reset) leaves no orphan hooks/state.
- The `--no-verify` git flag is honoured (hooks not run); workshop ledger is not corrupted by `--no-verify` commits.

### Test Coverage
- T-HOOK-CHAIN-{husky,precommit,raw}-01: with each fixture, install-hooks chains correctly.
- T-HOOK-BACKUP-01: backup file exists at `.git/hooks/pre-commit.workshop-backup.<ts>`.
- T-HOOK-IDENT-01: first line of every installed hook matches `# installed by sdd-evolution-harness-engineering workshop`.
- T-RESET-IDEMPOTENT-01: two consecutive `workshop reset` calls both exit 0; second run is a no-op.
- T-OVERRIDE-LEDGER-01: `workshop override --reason "spike"` then a commit succeeds; second commit is re-gated.
- T-NO-VERIFY-01: a commit with `git commit --no-verify` succeeds without firing workshop sensors and without ledger corruption.
- T-UNINSTALL-HYGIENE-01: after `workshop reset`, no `.workshop-*` files remain under `.git/hooks/`; state file is gone.

---

## Task T05: Computational sensors (`pre-commit-research-gate`, `pre-commit-plan-gate`, `pre-pr-verify-gate`)

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T04
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Ship three installable hook templates that enforce RPIV invariants and print both the failed
invariant and the remediation on failure. `pre-pr-verify-gate` enforces canonical
`project/issues/<N>/` paths (used also by Module 5's `install-promote-ephemeral`).

### Acceptance Criteria
- **CH-9**: three sensors ship; each self-identifies; each prints failed invariant + remediation.
- **CH-19**: Module 5's `pre-pr-verify-gate` enforces canonical `project/issues/<N>/` paths.
- Sensors are pure bash; no Node.js or SDK required.

### Test Coverage
- T-SENSOR-RESEARCH-{pass,fail}-01: passing/failing repo state produces exit 0/1 + correct message.
- T-SENSOR-PLAN-{pass,fail}-01: same.
- T-SENSOR-VERIFY-{pass,fail}-01: same; failing case names a missing `project/issues/<N>/verify.md` path.

---

## Task T06: Module action sheets `00-baseline.md` … `08-closing-kata.md`

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T01
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Author nine action-sheet modules ≤ ~80 lines each: commands to run, what the harness
enforces, debrief questions. Module narrative is delegated to the issue's Appendix A.
`modules/00-baseline.md` references the 90-minute agenda published in the README.

### Acceptance Criteria
- **CH-16**: nine module files exist, each ≤ ~80 lines, action-first format (commands, harness invariants, debrief questions).
- `00-baseline.md` references the 90-minute condensed agenda from README.

### Test Coverage
- T-MODULES-COUNT-01: exactly nine `modules/##-name.md` files exist.
- T-MODULES-SIZE-01: every module file ≤ 80 lines (`wc -l`).
- T-MODULES-LINK-01: `00-baseline.md` contains a relative reference to the README agenda anchor.

---

## Task T07: Scaffolders + `pendingScaffoldDrafts` + `accept-draft`/`reject-draft`

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** T03, T06
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement `workshop scaffold plan|research|verify|adr|core-component|guide|sensor` that
emits **draft candidates** with evidence and confidence into a workshop-internal drafts
location and registers an entry in `pendingScaffoldDrafts`. Implement
`workshop accept-draft <id>` (mutates canonical paths atomically; appends DECISION-LOG.md
where applicable; never auto-commits) and `workshop reject-draft <id>` (removes the draft).

### Acceptance Criteria
- **CH-15**: drafts carry explicit evidence + confidence; never auto-accepted; never
  appended to `DECISION-LOG.md` until accepted; never auto-committed.
- `workshop status` shows the pending drafts list.
- `accept-draft` validates the draft against the relevant target (e.g., ADR template
  shape) before writing; rejects malformed drafts with exit 1.

### Test Coverage
- T-SCAFFOLD-ADR-01: `workshop scaffold adr` creates a draft file + state entry; `git diff DECISION-LOG.md` is empty.
- T-ACCEPT-DRAFT-01: `workshop accept-draft <id>` writes the canonical ADR file and appends one DECISION-LOG.md row.
- T-REJECT-DRAFT-01: `workshop reject-draft <id>` removes the draft and state entry; canonical paths untouched.
- T-NO-AUTO-COMMIT-01: after any scaffold/accept, `git status --porcelain` shows unstaged changes — not a new commit.

---

## Task T08: Inferential coaches + `workshop coach <topic>` dispatcher

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T02, T07
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Ship at least two agent-prompt files (`post-research-coach.prompt.md`,
`post-plan-2x2-sensor.prompt.md`) and a `workshop coach <topic>` dispatcher. When the SDK
is unavailable, print the degraded-mode banner and exit 0 (coaches are inferential — they
are allowed to no-op in offline mode, but the banner must appear so the trainee knows).
`workshop coach kata` records trainee answers verbatim (no grading, no rewriting) into the
state file.

### Acceptance Criteria
- **CH-10**: ≥ 2 coaches ship as prompt files; invokable via `workshop coach <topic>`.
- **CH-17**: `workshop coach kata` records answers verbatim; does NOT grade or rewrite.
- **EC-2**: degraded-mode banner appears when SDK unavailable.

### Test Coverage
- T-COACH-DISPATCH-01: `workshop coach post-research-coach` exits 0 (with banner if offline).
- T-COACH-CATEGORY-01: a deliberately weak research brief triggers the critique category (presence check, not wording).
- T-COACH-CATEGORY-02: a concrete research brief does not trigger the critique category.
- T-COACH-KATA-VERBATIM-01: trainee input "  My answer  " stored verbatim, including whitespace.

---

## Task T09: 2×2 inspector `workshop diagnose 2x2`

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T05, T08
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement `workshop diagnose 2x2` (computational/inferential × guides/sensors) against the
trainee's repo. Classify detected guides and sensors into the four quadrants, identify
empty quadrants, and propose `workshop scaffold` follow-ups. `--json` output required.

### Acceptance Criteria
- **CH-11**: classifies guides+sensors into four quadrants; flags empty quadrants; proposes scaffold follow-ups; `--json` works.
- **CH-12**: `workshop next` (delivered in T03 with state machine; gated here) refuses to advance unless the current module's invariants pass, printing failures and remediations.

### Test Coverage
- T-DIAGNOSE-EMPTY-01: an empty repo classifies as four empty quadrants; `--json` is valid JSON with four entries.
- T-DIAGNOSE-POPULATED-01: a repo with `.github/agents/*.md` (guides) and `.git/hooks/pre-commit` (sensor) classifies into the correct quadrants.
- T-NEXT-GATE-01: `workshop next` exits 1 when current module's invariants fail and prints the remediation.

---

## Task T10: Brownfield onboarding `workshop onboard <path>` + fixture + security guards

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** T07
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement `workshop onboard <path>`: resolve with `realpath`, require interactive
confirmation (skippable with `--yes`), refuse symlink-escape, skip `.git`, `node_modules`,
`vendor`, `target`, `dist`, `build`, dot-prefixed dirs, and entries from the target's
`.gitignore`, enforce file-count + depth limits, redact secret-looking strings from
quoted evidence, emit ≥ 2 inferred-ADR drafts and ≥ 1 core-component proposal as
draft candidates (NEVER auto-applied to canonical paths). Commit the brownfield fixture
per research brief §Brownfield Test Fixture Recommendation.

### Acceptance Criteria
- **CH-18**: ≥ 2 ADR drafts + ≥ 1 core-component proposal emitted for the reference brownfield as draft candidates.
- **EC-8(a-f)**: realpath resolution, interactive confirmation (with `--yes`), symlink-escape refusal, default-skip directory list, gitignore honoured, size + depth limits, secret redaction.
- **EC-12**: no secrets written to any committed file in the fixture; redaction works.
- **CR-6**: no new repo-root convention.
- Fixture at `workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/` matches the research brief shape and contains zero secrets.

### Test Coverage
- T-ONBOARD-BROWNFIELD-01: against the fixture, ≥ 2 ADR drafts + ≥ 1 CC proposal; `DECISION-LOG.md` unchanged; size/depth limits not exceeded.
- T-ONBOARD-SYMLINK-01: a symlink escaping the confirmed root → exit non-zero with clear error.
- T-ONBOARD-TRAVERSAL-01: a `../` argument is refused.
- T-ONBOARD-SIZE-LIMIT-01: a fixture variant exceeding the file-count limit aborts with a clear message.
- T-ONBOARD-DEPTH-LIMIT-01: a directory at depth > max is skipped with a warning.
- T-ONBOARD-REDACTION-01: a fixture variant containing `ghp_…` produces an ADR draft where the token is replaced with `<REDACTED>` (or equivalent).
- T-ONBOARD-CONFIRM-01: without `--yes`, the resolved absolute path appears on stderr and stdin input gates execution.

---

## Task T11: Stretch deliverables — Module 5 `install-promote-ephemeral`, Module 6 quadrant fillers, Module 7 `fan-out`

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** T05, T09
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Implement Module 5's `workshop install-promote-ephemeral` (promotes an ephemeral workshop
artifact to canonical `project/issues/<N>/` paths under the `pre-pr-verify-gate`),
Module 6's diagnose-driven quadrant fillers (scaffold suggestions per empty quadrant), and
Module 7's `workshop fan-out --count <n>` (creates `<n>` `git worktree`s, runs RPIV
against each, reports collision points; each worktree carries its own state file + own
`flock`).

### Acceptance Criteria
- **CH-19**: Module 5 ships `install-promote-ephemeral` + `pre-pr-verify-gate` enforcement.
- **CH-20**: Module 7 ships `fan-out --count <n>` with per-worktree state + lock + collision report.
- **EC-14**: stretch modules 5, 6, 7 are independently runnable (completing Module 4 is not a prerequisite for Module 6).

### Test Coverage
- T-PROMOTE-01: `install-promote-ephemeral` against an ephemeral path produces the canonical `project/issues/<N>/` files; pre-pr-verify-gate passes after promotion.
- T-FAN-OUT-01: `workshop fan-out --count 2` creates two worktrees with two state files and two `flock` resources; collision report identifies overlapping paths.
- T-STRETCH-INDEPENDENT-01: starting Module 6 directly from baseline state succeeds without Module 4 having been completed.

---

## Task T12: SDK adapter, `extension/manifest.json`, `scaffold-with-copilot-sdk.md`

- **Status:** Pending
- **Complexity:** M
- **Dependencies:** T02–T11
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Add the thin `@github/copilot-sdk` adapter in `extension/commands/*.ts`. Each TypeScript
command delegates to the bash entrypoint; SDK-only features (coaches, agent scaffolders)
add value on top. Write `extension/manifest.json` declaring permission scope explicitly
(filesystem-write paths limited to `workshops/sdd-evolution-harness-engineering/`,
`.workshop-state.json`, `.git/hooks/`; `git` invocation; hook installation; no network in
offline mode). Author `scaffold-with-copilot-sdk.md` documenting the pinned SDK version,
pinned Node.js version, the adapter interface, and how the agent used the SDK to scaffold
commands/hooks/manifest.

### Acceptance Criteria
- **CH-4**: `extension/manifest.json` matches the SDK's documented format at implementation time and declares permission scope explicitly.
- **CH-6**: `scaffold-with-copilot-sdk.md` documents the pinned SDK version and concrete code references.
- **EC-6**: extension detects a previously-installed version and refuses side-by-side install; `--upgrade` is the sanctioned replacement.
- **EC-7**: `copilot /plugin uninstall` (or the documented equivalent) leaves no orphan hooks or state files (delegates to `workshop reset`).
- ADR-0004 §Cross-layout rule #4 honoured: nothing under `extension/` writes outside `workshops/<slug>/` or the documented permission scope.

### Test Coverage
- T-MANIFEST-PERMISSION-01: `extension/manifest.json` parses; permission scope keys are present and explicitly enumerated.
- T-SIDE-BY-SIDE-01: with a stub of "previously installed version" present, install refuses with exit non-zero; `--upgrade` proceeds.
- T-SDK-DELEGATE-01: each TS command invokes the bash entrypoint with matching args (mock subprocess).
- T-VERSION-PINNED-01: `scaffold-with-copilot-sdk.md` contains a line matching `^@github/copilot-sdk@\S+` and a Node.js pinned-version line.

---

## Task T13: Workshop README with 90-minute condensed agenda + attribution + MIT confirmation

- **Status:** Pending
- **Complexity:** S
- **Dependencies:** T06, T12
- **Related ADRs:** ADR-0004
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Author `workshops/sdd-evolution-harness-engineering/README.md` including a minute-by-minute
90-minute condensed agenda naming the exact `workshop` subcommands invoked per slot and the
stretch exercises explicitly skipped. Confirm MIT license. Include attribution where the
issue body specifies.

### Acceptance Criteria
- **CH-21**: README publishes a minute-by-minute 90-minute condensed agenda naming exact subcommands per slot and skipped stretch exercises.
- `workshop.json` `license` field matches the README license.

### Test Coverage
- T-AGENDA-01: README contains a section titled (regex) `90.minute` with `T+0` … `T+90` markers covering all 90 minutes.
- T-AGENDA-COMMANDS-01: every minute-slot in the agenda references a `workshop <subcommand>` that exists in the dispatcher (T02).

---

## Task T14: `workshops/README.md` catalogue update (Layout-A + Layout-B docs + Advanced table)

- **Status:** Pending
- **Complexity:** S
- **Dependencies:** T13
- **Related ADRs:** ADR-0002, ADR-0004
- **Related Core-Components:** None

### Description
Update `workshops/README.md`:
1. Revise the structural description so both Layout A (`steps/`) and Layout B
   (`extension/` + `modules/`) are documented side-by-side (decision #22).
2. Replace `*(none yet)*` in the Advanced table with a row for
   `sdd-evolution-harness-engineering`.

### Acceptance Criteria
- **CR-3**: Advanced table contains a row for the new workshop.
- **CR-4**: structural description documents both layouts in addition to `steps/`-style.
- Both layouts are presented as equally canonical (per ADR-0004 §Decision).

### Test Coverage
- T-CATALOGUE-LAYOUTS-01: `workshops/README.md` mentions both "steps/" and "extension/" in the structural description.
- T-CATALOGUE-ROW-01: the Advanced table row references the new workshop slug and difficulty.

---

## Task T15: Registry regeneration

- **Status:** Pending
- **Complexity:** XS
- **Dependencies:** T01, T14
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Run `scripts/rebuild-registry.sh` and commit the regenerated `tools/registry.json`. Do not
hand-edit (Decision #17). Commit the T00 verification report
(`project/issues/4/implementation/README.md`).

### Acceptance Criteria
- **CR-2**: `tools/registry.json` is regenerated via the script and contains the new workshop with POSIX-relative `path` and `manifest`.
- `tools/registry.json` matches `scripts/rebuild-registry.sh` output after stripping `generatedAt` (CI parity).

### Test Coverage
- T-REGISTRY-DERIVED-01: running `scripts/rebuild-registry.sh` produces a file identical (modulo `generatedAt`) to the committed `tools/registry.json`.

---

## Task T16: Integration tests + fixtures (consolidated)

- **Status:** Pending
- **Complexity:** L
- **Dependencies:** All prior tasks
- **Related ADRs:** ADR-0004
- **Related Core-Components:** None

### Description
Land every test in `03-test-plan.md` not already shipped with its functional task. Wire a
test harness (bash + `bats`/equivalent + `check-jsonschema`) under
`workshops/sdd-evolution-harness-engineering/test-fixtures/` plus an in-workshop
`run-tests.sh` that the Verifier stage can call. Add pre-existing-pre-commit fixtures
(Husky, pre-commit.com, raw hook) for T-HOOK-CHAIN tests.

### Acceptance Criteria
- **TT-1 … TT-14**: every Testing AC covered by an executable test or documented manual procedure.
- **TT-12/13/14**: manual verification procedures documented as a checklist in
  `workshops/sdd-evolution-harness-engineering/test-fixtures/MANUAL-VERIFICATION.md`.
- Integration suite runnable as a single command from the workshop directory.

### Test Coverage
- This task **is** the test layer for everything above. The full inventory lives in
  `03-test-plan.md`.
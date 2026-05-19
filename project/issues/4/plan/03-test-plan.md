# Test Plan — Issue #4

This plan enumerates every test that satisfies the issue's Testing acceptance criteria
**plus** ADR-coverage, registry, hook-chaining, `--no-verify`, and SDK-extension hygiene
tests called out in the planner brief. Tests are grouped by Type:

- **U** = Unit (single function / single file)
- **I** = Integration (end-to-end command in a fixture repo)
- **C** = Contract/schema (validates structure of an artifact)
- **M** = Manual (documented procedure)

Evidence shape for each test: **Exit code**, **stderr/stdout substring**, **file presence/
absence**, or **JSON-key presence** as appropriate. Exact LLM wording is NEVER asserted —
only category presence (per issue AC).

---

## Test T-SCHEMA-01: `workshop.json` validates

- **Type:** C
- **Task:** T01
- **Priority:** P0

### Setup
Run inside repo root in the devcontainer.

### Steps
1. `check-jsonschema --schemafile schemas/workshop.schema.json workshops/sdd-evolution-harness-engineering/workshop.json`

### Expected Result
- Exit code `0`. No stderr.

---

## Test T-LAYOUT-01: ADR-0004 directory layout present

- **Type:** C
- **Task:** T01
- **Priority:** P0

### Setup
Repo root.

### Steps
1. Assert each of: `workshops/sdd-evolution-harness-engineering/workshop.json`,
   `…/README.md`, `…/scaffold-with-copilot-sdk.md`, `…/extension/manifest.json`,
   `…/extension/bin/workshop`, `…/extension/commands/`, `…/extension/hooks/`,
   `…/extension/lib/`, `…/modules/00-baseline.md`, `…/modules/08-closing-kata.md`,
   `…/test-fixtures/brownfield/` exist.
2. Assert `…/extension/bin/workshop` is executable (`-x`).

### Expected Result
- All paths present; `extension/bin/workshop` mode bits include +x.

---

## Test T-LLMTXT-01: `LLM.txt` updated

- **Type:** C
- **Task:** T01
- **Priority:** P1

### Setup
Repo root.

### Steps
1. `grep -c 'sdd-evolution-harness-engineering' LLM.txt`

### Expected Result
- Output `1` (exactly one line added).

---

## Test T-DISPATCH-01: `workshop help` lists every command

- **Type:** I
- **Task:** T02
- **Priority:** P0

### Setup
Workshop installed; bash entrypoint on PATH.

### Steps
1. `extension/bin/workshop help`

### Expected Result
- Exit `0`. Output contains every command in the Canonical Command Inventory: `start`,
  `install-hooks`, `next`, `status`, `verify`, `coach`, `diagnose`, `reset`, `run`,
  `debrief`, `scaffold`, `override`, `reconcile`, `onboard`, `install-promote-ephemeral`,
  `fan-out`, `accept-draft`, `reject-draft`.

---

## Test T-DISPATCH-02: `workshop help --json` is valid JSON

- **Type:** I
- **Task:** T02
- **Priority:** P0

### Steps
1. `extension/bin/workshop help --json | jq .`

### Expected Result
- Exit `0`; `jq` parses successfully.

---

## Test T-NOCOLOR-01: `NO_COLOR` honoured

- **Type:** I
- **Task:** T02
- **Priority:** P0

### Steps
1. `NO_COLOR=1 TERM=dumb extension/bin/workshop help | od -c | grep -c '\\x1b\\['`

### Expected Result
- Count `0`.

---

## Test T-OFFLINE-BANNER-01: degraded-mode banner

- **Type:** I
- **Task:** T02 / T08
- **Priority:** P0

### Steps
1. `WORKSHOP_FORCE_OFFLINE=1 extension/bin/workshop coach post-research-coach 2>&1`

### Expected Result
- stderr contains substring `inferential coaches disabled — running in degraded mode`.

---

## Test T-FLOCK-MISSING-01: missing `flock` hard-fails

- **Type:** I
- **Task:** T02
- **Priority:** P1

### Setup
Shadow `flock` with an empty PATH or a no-op stub returning 127.

### Steps
1. `PATH=/tmp/empty extension/bin/workshop start`

### Expected Result
- Exit non-zero (≥ 1). stderr contains substring `flock`.

---

## Test T-JSON-01..04: `--json` works on `status`, `verify`, `diagnose`, `help`

- **Type:** I
- **Task:** T02 / T03 / T09
- **Priority:** P0

### Steps
For each command in {`status`, `verify`, `diagnose 2x2`, `help`}:
1. Run with `--json`; pipe to `jq .`.

### Expected Result
- `jq` parses successfully for all four.

---

## Test T-STATE-01: state file shape

- **Type:** I
- **Task:** T03
- **Priority:** P0

### Steps
1. `workshop start` in a fresh clone.
2. `jq 'keys' .workshop-state.json`

### Expected Result
- Keys include: `gitCommonDir`, `worktreePath`, `branch`, `headSha`, `currentModule`,
  `invariantsMet`, `installedHooks`, `overrideLedger`, `pendingScaffoldDrafts`.

---

## Test T-STATE-GITIGNORE-01: state file gitignored

- **Type:** I
- **Task:** T03
- **Priority:** P0

### Steps
1. Fresh clone with empty `.gitignore`.
2. `workshop start`.
3. `grep '.workshop-state.json' .gitignore`.

### Expected Result
- grep returns the line; exit `0`.

---

## Test T-NO-FILE-CONTENTS-01: state never contains file contents

- **Type:** I
- **Task:** T03
- **Priority:** P0

### Steps
1. Add a file `secrets.txt` with a known sentinel string `SHOULD_NOT_APPEAR_IN_STATE`.
2. `workshop start`, `workshop next`, `workshop verify`.
3. `grep SHOULD_NOT_APPEAR_IN_STATE .workshop-state.json`.

### Expected Result
- grep returns exit `1` (no match).

---

## Test T-DRIFT-RESET-01: detects `git reset --hard`

- **Type:** I
- **Task:** T03
- **Priority:** P0

### Steps
1. `workshop start`; commit a module artifact; `git reset --hard HEAD~1`.
2. `workshop status`.

### Expected Result
- Output mentions "drift" and recommends `workshop reconcile`.

---

## Test T-DRIFT-{REBASE,CHECKOUT,WORKTREE-REMOVE,WORKTREE-ADD,PR-MERGE}-01: detects each remaining trigger

- **Type:** I
- **Task:** T03
- **Priority:** P0

One test per trigger using a scripted fixture. Each asserts `workshop status` reports drift
and offers `workshop reconcile`.

### Expected Result (per test)
- Output substring `drift` AND `reconcile`.

---

## Test T-CONCURRENCY-01: two clones run simultaneously

- **Type:** I
- **Task:** T03
- **Priority:** P0

### Setup
Two separate `git clone`s of the same upstream into directories `A/` and `B/`.

### Steps
1. In `A/`, run `workshop start` in background.
2. Immediately in `B/`, run `workshop start`.
3. Wait for both.

### Expected Result
- Both exit `0`. `A/.workshop-state.json` and `B/.workshop-state.json` exist with
  distinct `gitCommonDir` values.

---

## Test T-HOOK-CHAIN-HUSKY-01

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Setup
Fixture repo with `.husky/pre-commit` present.

### Steps
1. `workshop install-hooks`.
2. Inspect `.git/hooks/pre-commit` (or the Husky-managed equivalent).

### Expected Result
- Workshop gate is invoked **after** Husky's chain (assert by inserting marker lines in
  Husky's pre-commit and asserting workshop output appears below them).
- Exit `0` on a passing commit; exit `1` on a failing one.

---

## Test T-HOOK-CHAIN-PRECOMMIT-01

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Setup
Fixture repo with `.pre-commit-config.yaml` and installed hooks.

### Steps
1. `workshop install-hooks`.
2. Run a commit.

### Expected Result
- pre-commit.com hooks run first; workshop gate runs after; backup of prior raw hook
  exists at `.git/hooks/pre-commit.workshop-backup.<ts>`.

---

## Test T-HOOK-CHAIN-RAW-01

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Setup
Fixture repo with a hand-written `.git/hooks/pre-commit` containing a sentinel.

### Steps
1. `workshop install-hooks`.
2. Commit.
3. `workshop reset` and re-commit.

### Expected Result
- After install: sentinel still runs; workshop gate runs after.
- Backup exists; first line of the installed hook matches `# installed by sdd-evolution-harness-engineering workshop`.
- After reset: original sentinel hook restored byte-for-byte (diff empty).

---

## Test T-HOOK-IDENT-01: hooks self-identify

- **Type:** C
- **Task:** T04 / T05
- **Priority:** P0

### Steps
1. `workshop install-hooks` in a fresh repo.
2. `head -n1 .git/hooks/pre-commit-research-gate` (and others).

### Expected Result
- Each first line matches the regex `^# installed by sdd-evolution-harness-engineering workshop`.

---

## Test T-RESET-IDEMPOTENT-01

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Steps
1. `workshop reset` (after a prior install).
2. `workshop reset` again.

### Expected Result
- Both exit `0`. Second run prints "no-op" or equivalent and changes nothing on disk
  (verify `git status` clean for `.git/hooks/`).

---

## Test T-OVERRIDE-LEDGER-01

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Steps
1. With sensors installed, attempt a commit that violates an invariant → blocked.
2. `workshop override --reason "spike"`; retry commit → succeeds.
3. Inspect `workshop status` → ledger entry visible.
4. Attempt another commit that violates the same invariant → blocked (re-gated).

### Expected Result
- Step 1: exit `1` from hook. Step 2: exit `0`. Step 3: ledger row present. Step 4: exit `1`.

---

## Test T-NO-VERIFY-01: `--no-verify` honoured

- **Type:** I
- **Task:** T04
- **Priority:** P0

### Steps
1. With sensors installed and a state in which the sensor would block: `git commit --no-verify -m "ci: bypass"`.
2. Inspect state file's `overrideLedger`.

### Expected Result
- Commit succeeds (`--no-verify` semantics). Workshop sensors are NOT executed (git
  contract). `overrideLedger` is unchanged (no spurious entry; the workshop must not
  confuse `--no-verify` with `workshop override`).

---

## Test T-UNINSTALL-HYGIENE-01

- **Type:** I
- **Task:** T04 / T12
- **Priority:** P0

### Steps
1. Install workshop (extension or bash); `workshop install-hooks`.
2. `workshop reset` (or `copilot /plugin uninstall` if available).
3. `find .git/hooks -name '*workshop*'`.
4. `test -f .workshop-state.json`.

### Expected Result
- find returns no rows. Step 4 exits non-zero (file absent).

---

## Test T-SENSOR-{RESEARCH,PLAN,VERIFY}-{PASS,FAIL}-01

- **Type:** I
- **Task:** T05
- **Priority:** P0

For each sensor and each state (pass / fail):

### Steps
1. Stage repo state matching the sensor's invariant or violating it.
2. Invoke the hook directly (`bash .git/hooks/pre-commit-research-gate`).

### Expected Result
- Pass state: exit `0`.
- Fail state: exit `1`; stderr names BOTH the failed invariant and the remediation.

---

## Test T-MODULES-{COUNT,SIZE,LINK}-01

- **Type:** C
- **Task:** T06
- **Priority:** P1

### Steps
1. `ls workshops/sdd-evolution-harness-engineering/modules/*.md | wc -l` → 9.
2. `wc -l workshops/sdd-evolution-harness-engineering/modules/*.md` → every count ≤ 80.
3. `grep -l '90.minute' modules/00-baseline.md` → matches.

### Expected Result
- All three assertions pass.

---

## Test T-SCAFFOLD-ADR-01 / T-ACCEPT-DRAFT-01 / T-REJECT-DRAFT-01 / T-NO-AUTO-COMMIT-01

- **Type:** I
- **Task:** T07
- **Priority:** P0

### Setup
Clean working tree.

### Steps
1. `workshop scaffold adr "Adopt X for Y"`.
2. `git diff -- project/architecture/ADR/DECISION-LOG.md`.
3. `git log -1 --pretty=%s` (assert no new commit was made).
4. Inspect `pendingScaffoldDrafts` in the state file → contains the new id.
5. `workshop accept-draft <id>`; verify ADR file appears and DECISION-LOG.md row appended.
6. In a parallel scenario, `workshop reject-draft <id>` removes the draft + state entry; canonical paths untouched.

### Expected Result
- Step 2: diff empty after scaffold. Step 3: no new commit. Step 5: ADR file present, one row appended, but NOT committed (working tree dirty). Step 6: draft gone; DECISION-LOG.md unchanged.

---

## Test T-COACH-DISPATCH-01 / T-COACH-CATEGORY-{01,02} / T-COACH-KATA-VERBATIM-01

- **Type:** I
- **Task:** T08
- **Priority:** P1

### Steps
1. `workshop coach post-research-coach` → exit `0` (banner OK if offline).
2. Feed a deliberately weak research brief; assert the critique-category marker appears in
   coach output (presence check; exact wording not asserted).
3. Feed a concrete brief; assert the critique-category marker is absent.
4. `workshop coach kata` with stdin `"  My answer  "`; inspect state file `kata` field
   character-for-character.

### Expected Result
- Step 2 marker present. Step 3 absent. Step 4: value preserved including whitespace.

---

## Test T-DIAGNOSE-EMPTY-01 / T-DIAGNOSE-POPULATED-01

- **Type:** I
- **Task:** T09
- **Priority:** P0

### Steps
1. In an empty fixture, `workshop diagnose 2x2 --json` → JSON with four quadrants all empty.
2. In a fixture with `.github/agents/foo.md` and an installed sensor, run again → quadrant
   populations match the fixture.

### Expected Result
- Step 1: JSON shape `{"computational_guides": [], "inferential_guides": [], "computational_sensors": [], "inferential_sensors": []}` (or equivalent four-key shape) with all empty.
- Step 2: each quadrant correctly populated.

---

## Test T-NEXT-GATE-01

- **Type:** I
- **Task:** T03 / T09
- **Priority:** P0

### Steps
1. From a state where current-module invariants fail, `workshop next`.

### Expected Result
- Exit `1`; stderr names failed invariant AND remediation.

---

## Test T-ONBOARD-BROWNFIELD-01

- **Type:** I
- **Task:** T10
- **Priority:** P0

### Setup
Reference fixture `workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/`.

### Steps
1. `workshop onboard --yes workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/`.
2. Inspect `pendingScaffoldDrafts`.
3. `git diff -- project/architecture/ADR/DECISION-LOG.md`.

### Expected Result
- ≥ 2 ADR drafts and ≥ 1 core-component proposal in `pendingScaffoldDrafts`.
- DECISION-LOG.md diff empty.
- Each draft contains an `evidence` field and a `confidence` field.

---

## Test T-ONBOARD-SYMLINK-01 / T-ONBOARD-TRAVERSAL-01

- **Type:** I
- **Task:** T10
- **Priority:** P0

### Steps
1. Create a symlink inside the fixture pointing to `/etc/passwd`; `workshop onboard --yes <fixture>`.
2. `workshop onboard --yes ../../some/path`.

### Expected Result
- Both exit non-zero with a clear error naming the refused path or refusing
  traversal/symlink-escape.

---

## Test T-ONBOARD-SIZE-LIMIT-01 / T-ONBOARD-DEPTH-LIMIT-01

- **Type:** I
- **Task:** T10
- **Priority:** P1

### Steps
1. Generate a fixture variant exceeding the documented file-count limit; run onboard.
2. Generate a variant with a path at depth > max; run onboard.

### Expected Result
- Size variant: aborts with exit non-zero and a clear message naming the limit.
- Depth variant: deeper path is skipped with a warning (exit `0` for the run as a whole).

---

## Test T-ONBOARD-REDACTION-01

- **Type:** I
- **Task:** T10
- **Priority:** P0

### Setup
Fixture variant containing `GITHUB_TOKEN="ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"`.

### Steps
1. `workshop onboard --yes <variant>`.
2. `grep -r ghp_ workshops/sdd-evolution-harness-engineering/test-fixtures/.drafts/ || true`.

### Expected Result
- No `ghp_` substring in any draft (token replaced by a placeholder).

---

## Test T-ONBOARD-CONFIRM-01

- **Type:** I
- **Task:** T10
- **Priority:** P1

### Steps
1. `workshop onboard <relative-path>` without `--yes`; pipe `n\n` to stdin.

### Expected Result
- stderr contains the absolute path (from `realpath`). Exit `0` after explicit decline; no
  drafts emitted.

---

## Test T-PROMOTE-01 / T-FAN-OUT-01 / T-STRETCH-INDEPENDENT-01

- **Type:** I
- **Task:** T11
- **Priority:** P1

### Steps (T-PROMOTE-01)
1. Author an ephemeral artifact under a temp module path.
2. `workshop install-promote-ephemeral <id>`; commit.

### Expected Result (T-PROMOTE-01)
- Canonical `project/issues/<N>/{research,plan,verify}.md` paths populated; `pre-pr-verify-gate` passes.

### Steps (T-FAN-OUT-01)
1. `workshop fan-out --count 2`.
2. Inspect each created worktree for its own state file and lock file.

### Expected Result (T-FAN-OUT-01)
- 2 worktrees exist; 2 state files present; collision report (stdout or file) identifies
  shared canonical paths.

### Steps (T-STRETCH-INDEPENDENT-01)
1. Fresh repo. `workshop start`. Skip Modules 1–4. `workshop next --to module-6`.

### Expected Result (T-STRETCH-INDEPENDENT-01)
- Exit `0`; state file `currentModule` set to module-6.

---

## Test T-MANIFEST-PERMISSION-01 / T-SIDE-BY-SIDE-01 / T-SDK-DELEGATE-01 / T-VERSION-PINNED-01

- **Type:** C + I
- **Task:** T12
- **Priority:** P0

### Steps
1. `jq '.permissions' extension/manifest.json` → object listing filesystem-write paths, git invocation, hook installation, network (none in offline).
2. With a stub of "previously-installed version" present (e.g., a sentinel file in the install registry), invoke install → exit non-zero. Invoke `--upgrade` → exit `0`.
3. Mock subprocess: each TS command in `extension/commands/` invokes the bash entrypoint with the matching argv.
4. `grep -E '@github/copilot-sdk@\S+' scaffold-with-copilot-sdk.md && grep -E '^Node\.js.*v\d' scaffold-with-copilot-sdk.md`.

### Expected Result
- Step 1: object present and enumerates each permission category.
- Step 2: side-by-side refused; `--upgrade` proceeds.
- Step 3: each delegate call observed.
- Step 4: both greps succeed.

---

## Test T-AGENDA-01 / T-AGENDA-COMMANDS-01

- **Type:** C
- **Task:** T13
- **Priority:** P1

### Steps
1. README contains a section matching `90.minute` with `T+0` … `T+90` markers.
2. Every minute-slot references a `workshop <subcommand>` that exists in
   `extension/bin/workshop`'s dispatcher.

### Expected Result
- Both assertions pass.

---

## Test T-CATALOGUE-LAYOUTS-01 / T-CATALOGUE-ROW-01

- **Type:** C
- **Task:** T14
- **Priority:** P0

### Steps
1. `grep -E 'steps/' workshops/README.md && grep -E 'extension/' workshops/README.md`.
2. `grep sdd-evolution-harness-engineering workshops/README.md`.

### Expected Result
- Both steps return matches.

---

## Test T-REGISTRY-DERIVED-01: registry matches script output (CI parity)

- **Type:** C
- **Task:** T15
- **Priority:** P0

### Steps
1. `cp tools/registry.json /tmp/committed.json`.
2. `scripts/rebuild-registry.sh`.
3. `jq 'del(.generatedAt)' /tmp/committed.json > /tmp/a; jq 'del(.generatedAt)' tools/registry.json > /tmp/b; diff /tmp/a /tmp/b`.

### Expected Result
- diff empty; exit `0`.

---

## Test T-CI-VALIDATE-01: CI workflow passes locally

- **Type:** I
- **Task:** T15 / T16
- **Priority:** P0

### Steps
1. Reproduce the CI's `validate-schemas` job: `check-jsonschema --schemafile schemas/workshop.schema.json workshops/*/workshop.json` and `… schemas/tool.schema.json tools/*/tool.json`.
2. Reproduce the CI's `check-registry` job locally.

### Expected Result
- Both exit `0` on the PR branch.

---

## Test T-OFFLINE-INTEGRATION-01: Module 0 → 2 → 3 offline walkthrough

- **Type:** I
- **Task:** T16
- **Priority:** P0

### Setup
Fresh fixture repo. `WORKSHOP_FORCE_OFFLINE=1`. SDK deliberately disabled.

### Steps
1. `workshop start`.
2. `workshop install-hooks`.
3. Perform Module 0 actions, then `workshop next`.
4. Perform Module 2 actions, `workshop next`.
5. Perform Module 3 actions, `workshop verify`.

### Expected Result
- Degraded-mode banner appears on every coach invocation.
- Computational sensors fire and block on a deliberately violating commit.
- `workshop verify` exits `0` at the end.

---

## Test T-MANUAL-FACILITATOR-01

- **Type:** M
- **Task:** T16 (manual)
- **Priority:** P0

### Steps
A facilitator runs the published minute-by-minute 90-minute condensed agenda end-to-end
inside the devcontainer. Document outcome and any skipped commands in
`test-fixtures/MANUAL-VERIFICATION.md`.

### Expected Result
- Every `workshop` subcommand invoked by the agenda runs as documented.

---

## Test T-MANUAL-TRAINEE-01

- **Type:** M
- **Task:** T16 (manual)
- **Priority:** P1

### Steps
An unprimed trainee, given only `workshops/sdd-evolution-harness-engineering/README.md`,
runs `copilot workshop start` (or bash fallback) and reaches Module 2 without external docs.

### Expected Result
- Trainee reaches Module 2 ≤ 25 minutes; ≥ 1 sensor fires during the run; documented in
  `MANUAL-VERIFICATION.md`.

---

## Test T-MANUAL-META-01

- **Type:** M
- **Task:** T16 (manual)
- **Priority:** P1

### Steps
An AI agent given only `LLM.txt`, `tools/registry.json`, and the workshop's `workshop.json`
must describe what the workshop teaches and how to start it.

### Expected Result
- The agent's summary mentions: harness engineering, RPIV invariants, `workshop start`
  entrypoint, advanced difficulty. Documented in `MANUAL-VERIFICATION.md`.

---

## Coverage Matrix

| AC Group | Count | Tests | Coverage |
|----------|-------|-------|----------|
| Core/harness (CH-1..CH-21) | 19 | T-LAYOUT, T-DISPATCH, T-HOOK-CHAIN, T-HOOK-IDENT, T-SENSOR, T-OVERRIDE-LEDGER, T-RESET-IDEMPOTENT, T-NEXT-GATE, T-DIAGNOSE, T-COACH-*, T-MODULES, T-ONBOARD-BROWNFIELD, T-PROMOTE, T-FAN-OUT, T-AGENDA, T-SCAFFOLD-ADR, T-ACCEPT-DRAFT, T-REJECT-DRAFT, T-NO-AUTO-COMMIT, T-COACH-KATA-VERBATIM | 100% |
| Core/state (CS-1..CS-4) | 4 | T-STATE-01, T-DRIFT-*, T-CONCURRENCY-01, T-NO-FILE-CONTENTS-01 | 100% |
| Core/repo-compliance (CR-1..CR-6) | 6 | T-SCHEMA-01, T-REGISTRY-DERIVED-01, T-CATALOGUE-ROW-01, T-CATALOGUE-LAYOUTS-01, T-LLMTXT-01, T-LAYOUT-01 | 100% |
| Edge Cases (EC-1..EC-14) | 13 | T-DISPATCH, T-OFFLINE-BANNER, T-OFFLINE-INTEGRATION, T-RESET-IDEMPOTENT, T-HOOK-IDENT, T-SIDE-BY-SIDE, T-UNINSTALL-HYGIENE, T-ONBOARD-*, T-NOCOLOR, T-JSON-*, T-STATE-GITIGNORE, T-NO-FILE-CONTENTS, T-STRETCH-INDEPENDENT, T-NO-VERIFY | 100% |
| Testing (TT-1..TT-14) | 14 | every test above + T-CI-VALIDATE-01, T-MANUAL-* | 100% |

Total automated tests: **51**. Manual tests: **3**. **Total tests: 54**.

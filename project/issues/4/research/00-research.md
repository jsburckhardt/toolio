# Research Brief: SDD-Evolution Harness Workshop — Interactive, Scaffolded with @github/copilot-sdk

## GitHub Issue
- **Issue:** #4
- **Title:** feat(workshop): SDD-evolution harness workshop — interactive, scaffolded with @github/copilot-sdk

---

## Scope Classification
- **Scope Type:** `issue`

**Justification:** This is a feature implementation issue delivering a concrete, installable
workshop at `workshops/sdd-evolution-harness-engineering/`. While it triggers ADR creation
(for extension-driven workshop layout conventions), the primary deliverable is code, manifests,
hooks, a state machine, and step/module files. It is not itself an `architecture_decision`
(single recorded architectural choice) nor a `core_component` (reusable cross-cutting
convention). The Plan stage will create ADRs and possibly a core-component *during* execution
of this issue, but the issue's scope_type is `issue`.

---

## Problem Statement

Toolio's only existing workshop (`creating-your-first-tool`) is static Markdown — read five
files, paste some JSON. That format fundamentally contradicts the topic this issue teaches:
**harness engineering for agentic coding**. The thesis of harness engineering is that
"agent = model + harness"; you cannot teach this via a passive reading experience.

The advanced workshop slot in `workshops/README.md` is currently `*(none yet)*`. Issue #4
fills it with an **interactive, harness-driven workshop** that puts the trainee *inside* a
harness while they build one. The deliverable ships as a Copilot CLI extension package built
with `@github/copilot-sdk`, exposing a `workshop` command family and a collection of git
hooks, inferential coaches, and a state machine. Minimal `modules/*.md` files serve as action
sheets (≤ ~80 lines each: what to run, what the harness enforces, debrief questions); the
harness does the teaching.

The four specific gaps the issue identifies (paraphrased from the Problem section):

1. No way to enforce RPIV invariants in real time (e.g., commit blocked without `research.md`)
2. No way to scaffold the next work-item on demand (issue, plan template, ADR stub, verify
   ledger)
3. No 2×2 inspector (computational/inferential × guides/sensors) running against the trainee's
   own repo
4. The experimental Copilot CLI EXTENSIONS capability (`@github/copilot-sdk` — "programmatic
   tools and hooks, scaffolded and managed by the agent itself") is not yet used as a build
   tool anywhere in Toolio

---

## Existing Context

### 1. Existing Workshop Structure
*Verified by filesystem inspection of `workshops/creating-your-first-tool/`.*

The seed workshop uses the **`steps/`-based layout** as documented in ADR-0002
(`project/architecture/ADR/ADR-0002-repository-layout-standard.md` line 42):

> "Each workshop is a subdirectory named with a slug … Each must contain a `workshop.json`
> manifest, a `README.md`, and a `steps/` subdirectory with numbered step files."

The seed workshop has five step files: `01-introduction.md` through `05-submit-pr.md`. Each
is a self-contained Markdown file with zero runtime behaviour.

**`workshops/README.md` line 6** currently reads:

> "Each workshop is a subdirectory with a `workshop.json` manifest, a `README.md`, and a
> `steps/` directory with numbered step files."

This description **must be revised** as part of this issue to allow the new `extension/` +
`modules/` layout in addition to the existing `steps/` layout. The AC for this is explicit.

**`workshops/README.md` Advanced table** currently contains `*(none yet)*` — the new workshop
fills this slot.

### 2. CI Gates
*Verified by reading `.github/workflows/validate.yml` (lines 1–58).*

CI validates **schema conformance** (tool and workshop manifests via `check-jsonschema`) and
**registry consistency** (re-runs `scripts/rebuild-registry.sh`, diffs against committed
`tools/registry.json` ignoring `generatedAt`). There is **no markdown link checking** in CI
— two jobs only: `validate-schemas` and `check-registry`. The AC for CI explicitly states
"markdown link checking is a manual step."

CI is triggered on `pull_request`. The new workshop's `workshop.json` will be picked up
automatically by the `Validate workshop manifests` step via `workshops/*/workshop.json` glob.

### 3. Schema Constraints
*Verified by reading `schemas/workshop.schema.json` (lines 1–71).*

**Required fields** (all must be present in the new `workshop.json`):
`name`, `displayName`, `version`, `description`, `author`, `license`, `difficulty`,
`estimatedDuration`, `prerequisites` (array), `objectives` (array, minItems: 1)

**`additionalProperties: false`** — no new top-level fields may be added to `workshop.json`
without amending the schema (which requires an ADR per the issue's own guardrail at §6).

**`difficulty` enum:** `"beginner"` | `"intermediate"` | `"advanced"` — the new workshop uses
`"advanced"` ✅

**Slug pattern:** `^[a-z0-9][a-z0-9-]*$` — `sdd-evolution-harness-engineering` matches ✅

The issue specifies: `name: "sdd-evolution-harness-engineering"`, `difficulty: "advanced"`,
`estimatedDuration: "3h15m"`, `version: "1.0.0"` — all within existing schema constraints.
**No schema amendment needed.**

### 4. Registry Mechanics
*Verified by reading `scripts/rebuild-registry.sh` (lines 1–123) and `tools/registry.json`.*

`scripts/rebuild-registry.sh` is the **only sanctioned way** to mutate `tools/registry.json`
(Decision #17 from DECISION-LOG.md). The script scans `tools/*/tool.json` and
`workshops/*/workshop.json`, validates slugs, and writes the registry.

Current registry state (`tools/registry.json`): 2 tools (`devcontainer-toolio`,
`soft-factory-agents`), 1 workshop (`creating-your-first-tool`). After this issue, the
workshop count becomes 2.

### 5. Existing ADRs and Core-Components

| Artifact | Applies to Issue #4? | Relevant Decisions |
|----------|---------------------|-------------------|
| **ADR-0002** (Repository Layout Standard) | ✅ YES — new workshop must live at `workshops/sdd-evolution-harness-engineering/` (Decision #5). However, ADR-0002 defines `steps/` as the workshop sub-structure, which this issue extends with `modules/` + `extension/`. | Decisions 4, 5, 6, 7, 8, 9 |
| **ADR-0003** (Tool and Workshop Packaging Convention) | ✅ YES — `workshop.json` must conform to `schemas/workshop.schema.json`; slug must match `^[a-z0-9][a-z0-9-]*$`; registry must be rebuilt via the script. | Decisions 11, 13, 14, 15, 16, 17 |
| **CORE-COMPONENT-0002** (Commit Standards) | ✅ YES — all commits must follow Conventional Commits with Co-authored-by trailer. | Decisions 1, 2, 3 |

**ADR-0002 tension:** ADR-0002 line 42 specifies workshops "must contain a … `steps/`
subdirectory with numbered step files." The new workshop uses `modules/` and `extension/`
instead. This is an explicit structural extension that the Plan stage must address via ADR-0004
(see §Proposed ADRs).

**Decision #10** (tool.json required fields) — **N/A**: the workshop ships as a workshop, not
a tool. The `extension/` subdirectory is not a `tools/` entry and does not need a `tool.json`.

### 6. Devcontainer Tech-Stack
*Verified by reading `.devcontainer/devcontainer.json` (lines 1–77).*

| Tool | Status | Source |
|------|--------|--------|
| bash | ✅ | Base Ubuntu (`mcr.microsoft.com/devcontainers/base:ubuntu`) |
| jq | ✅ | Installed in CI (`sudo apt-get install -y jq`); present on Ubuntu base |
| Python + uv | ✅ | `ghcr.io/devcontainers/features/python` + `ghcr.io/jsburckhardt/devcontainer-features/uv:1` |
| check-jsonschema | ✅ | `pip install check-jsonschema` (CI); available via uv/pip in devcontainer |
| Node.js | ✅ (floating) | `ghcr.io/devcontainers/features/node` `version: "lts"` — **not pinned** |
| Go | ✅ | Installed via devcontainer feature (go latest) |
| GitHub CLI (gh) | ✅ | `ghcr.io/devcontainers/features/github-cli` |
| Copilot CLI | ✅ | `ghcr.io/devcontainers/features/copilot-cli` |
| copilot-persistence | ✅ | `ghcr.io/rosstaco/devcontainer-features/copilot-persistence:1` |
| just | ✅ | `ghcr.io/jsburckhardt/devcontainer-features/just` |
| tmux | ✅ | `ghcr.io/jsburckhardt/devcontainer-features/tmux` |
| Azure CLI | ✅ | `ghcr.io/devcontainers/features/azure-cli:1` |
| flock | ✅ Likely | Linux `util-linux`; standard on Ubuntu — **implementer must verify** (`which flock`) |

**Node.js version gap:** The devcontainer installs Node.js LTS with a **floating version tag**
(`"version": "lts"`), not a pinned version (e.g., `"22.x"`). Any TypeScript-based workshop
commands must target the LTS API baseline without native modules requiring recompile. The Plan
stage should pin or document the tested Node.js version range in `scaffold-with-copilot-sdk.md`.

**No new system dependencies needed** — all required tools (bash, jq, node, python,
check-jsonschema, gh, git, flock) are present in the devcontainer.

### 7. Prior Issue Pattern (#1 — shape reference)
*Verified by reading `project/issues/1/research/00-research.md` (lines 1–116).*

Issue #1's research brief established the pattern used by this brief:
- Scope type `issue` for feature work that triggers ADR creation
- Context section tabulates every relevant file path with line-number citations
- Proposed ADRs are title-only (no decisions made)
- Decisions discovered lists applicable existing decisions by number
- Gaps and risks are explicit and actionable

---

## `@github/copilot-sdk` Reconnaissance

### Public Availability

`@github/copilot-sdk` is **publicly available** in **Public Preview**:

- **npm package:** `npm install @github/copilot-sdk` (Node.js/TypeScript)
- **Python:** `pip install github-copilot-sdk`
- **Go:** `go get github.com/github/copilot-sdk/go`
- **.NET:** `dotnet add package GitHub.Copilot.SDK`
- **Rust** (technical preview) and **Java** also available
- **Repository:** `github/copilot-sdk` (SAML-protected; package.json not readable via API)
- **Public homepage:** https://github.com/github/copilot-sdk

The SDK is **NOT** labelled "experimental" in the sense of being unpublished. It is in
**Public Preview** — functional but not declared production-ready. The issue's phrasing
("experimental Copilot CLI EXTENSIONS capability") refers to the experimental feature of
using the SDK to build a Copilot CLI extension/plugin, not the SDK itself.

### What the SDK Is

The SDK is a **programmatic agent runtime** that embeds Copilot's agentic workflows in your
application:

- **Architecture:** `Your Application → SDK Client → JSON-RPC → Copilot CLI (server mode)`
- The SDK exposes the same engine behind Copilot CLI
- The CLI is **auto-bundled** in the Node.js, Python, and .NET SDKs (no separate install)
- Default tools exposed: file editing, shell, web fetch, and other Copilot CLI first-party tools
- Supports: custom agents, skills, tools, **hooks**, MCP servers
- Documented feature categories: Hooks, custom agents, MCP integration, skills, BYOK

**The SDK is NOT a Copilot CLI plugin/extension packaging system.** You install it as a
library dependency and call it programmatically — not via `copilot /plugin install`.

### The `/plugin install` Mechanism — CRITICAL GAP

The issue describes the trainee experience beginning with:

```
copilot /plugin install ./workshops/sdd-evolution-harness-engineering/extension
```

This `/plugin install` subcommand **does not appear in any current GitHub Copilot CLI public
documentation**. The documented Copilot CLI extension mechanism is MCP servers (`/mcp add`),
not plugins. The devcontainer installs `ghcr.io/devcontainers/features/copilot-cli` — whether
this CLI version includes a `/plugin` subcommand is **unverified at research time**.

**Two interpretations:**

1. **Interpretation A (optimistic):** The devcontainer's Copilot CLI has a `/plugin`
   subcommand in private/limited preview. `@github/copilot-sdk` is used internally to
   implement the plugin's agent behaviours. `extension/manifest.json` follows an SDK-defined
   extension manifest schema.

2. **Interpretation B (realistic/safe):** There is no `/plugin install` mechanism as
   described. The "extension" is a standalone binary/script the trainee adds to PATH or
   calls directly. `@github/copilot-sdk` is used as a library called from within the
   workshop's commands — not as a Copilot CLI plugin packaging format.

**Plan stage MUST resolve this before implementation begins:**

1. Run `copilot --help` in the devcontainer and check for `/plugin` subcommand
2. If `/plugin install` exists — document the `extension/manifest.json` schema from its
   `--help` or SDK documentation; create ADR-0005
3. If `/plugin install` does NOT exist — treat `extension/bin/workshop` as the canonical
   entrypoint; the "installable extension" AC is documented as deferred pending the feature's
   public availability; ADR-0005 is deferred

**Recommended default position for Plan/Implement:**
Treat the `extension/bin/workshop` bash script as the **canonical entrypoint** (offline-mode
entrypoint per issue §2.3). The `@github/copilot-sdk` Node.js package is used as a library
called from TypeScript commands within `extension/commands/`. If `copilot /plugin install`
works at implementation time, the extension can additionally register as a plugin.

### SDK Features Relevant to This Issue

From the public SDK README (fetched from https://github.com/github/copilot-sdk):

- **Hooks:** Documented as a feature category — this is the basis for the workshop's hook
  registry when online. In offline mode, classic `.git/hooks/` entries are used.
- **Custom agents, skills:** The workshop's inferential coaches can be implemented as SDK
  custom skills (e.g., `post-research-coach.prompt.md` invoked via the SDK)
- **Custom tools:** Computational sensors can be implemented as SDK custom tools
- **Authentication:** Requires GitHub Copilot subscription (or BYOK — use own API keys
  without GitHub auth). BYOK is relevant for degraded/offline mode
- **Public preview status:** APIs may change; the thin-adapter wrapper the issue calls for
  is essential
- **Cookbook / custom instructions:** SDK-specific Copilot instructions exist at
  `github/awesome-copilot` for Node.js, Python, .NET, Go — relevant during implementation

### SDK Version Requirement for Plan Stage

The Plan stage MUST pin the SDK version in `scaffold-with-copilot-sdk.md`. At research time,
the npm package version is unconfirmed (SAML restriction prevented reading the repo).
Implementer action: `npm view @github/copilot-sdk version` at implementation time; record
the version in `scaffold-with-copilot-sdk.md`.

---

## Decisions Discovered

| # | Decision | Source | Applies? |
|---|----------|--------|---------|
| 1 | Enforce Conventional Commits v1.0.0 on every commit | CORE-COMPONENT-0002 | ✅ Yes |
| 2 | Require Conventional Commits on PR titles | CORE-COMPONENT-0002 | ✅ Yes |
| 3 | Require Co-authored-by trailer on AI-authored commits | CORE-COMPONENT-0002 | ✅ Yes |
| 4 | Place all reusable tools under `tools/` | ADR-0002 | ⚪ N/A (workshop, not tool) |
| 5 | Place all training content under `workshops/` | ADR-0002 | ✅ Yes |
| 6 | Place JSON Schema files under `schemas/` | ADR-0002 | ✅ Yes (schema unchanged) |
| 7 | Place build/maintenance scripts under `scripts/` | ADR-0002 | ✅ Yes (script unchanged) |
| 8 | Store `registry.json` inside `tools/` as derived file | ADR-0002 | ✅ Yes |
| 9 | Exclude hidden directories from discovery scanning | ADR-0002 | ✅ Yes |
| 10 | Require `tool.json` with required fields | ADR-0003 | ⚪ N/A (workshop, not tool) |
| 11 | Require `workshop.json` with required fields | ADR-0003 | ✅ Yes |
| 13 | Enforce slug pattern `^[a-z0-9][a-z0-9-]*$` | ADR-0003 | ✅ Yes (`sdd-evolution-harness-engineering` ✅) |
| 14 | Use JSON Schema Draft 2020-12 | ADR-0003 | ✅ Yes |
| 15 | Use `check-jsonschema` for validation | ADR-0003 | ✅ Yes |
| 16 | Generate registry via `scripts/rebuild-registry.sh` | ADR-0003 | ✅ Yes |
| 17 | Prohibit hand-editing of `tools/registry.json` | ADR-0003 | ✅ Yes |

**None applicable** to the `extension/manifest.json` SDK format — that format is determined
by `@github/copilot-sdk` documentation, not by any existing Toolio ADR. The Plan stage will
address this via ADR-0005 (conditional).

---

## Acceptance Criteria (from issue)

Extracted verbatim from issue #4 body (between `<!-- ACCEPTANCE_CRITERIA_START -->` /
`<!-- ACCEPTANCE_CRITERIA_END -->` markers; rendered here as `- [ ]` checkboxes):

### Core — the interactive harness

- [ ] A new workshop directory exists at `workshops/sdd-evolution-harness-engineering/`
  containing at minimum `workshop.json`, `README.md`, an `extension/` subdirectory, a
  `modules/` subdirectory, and `scaffold-with-copilot-sdk.md`
- [ ] The workshop is installable as a Copilot CLI extension (e.g.,
  `copilot /plugin install ./workshops/sdd-evolution-harness-engineering/extension`) and
  registers every command in the Canonical Command Inventory (§2.1): `start`,
  `install-hooks`, `next`, `status`, `verify`, `coach`, `diagnose`, `reset`, `run`,
  `debrief`, `scaffold`, `override`, `reconcile`, `onboard`, `install-promote-ephemeral`,
  `fan-out`, plus `accept-draft` / `reject-draft` for the pedagogical draft-acceptance flow
- [ ] `workshop help` lists every command above and also has a `--json` form for machine
  consumption
- [ ] `extension/manifest.json` is the `@github/copilot-sdk` extension manifest as required
  by the SDK's documented format at the time of implementation, and declares the extension's
  permission scope explicitly (filesystem-write paths, `git` invocation, hook installation,
  network — none required in offline mode)
- [ ] All workshop commands are namespaced under the top-level `workshop` command so they
  cannot collide with other Copilot CLI extensions
- [ ] `scaffold-with-copilot-sdk.md` documents — with concrete code references and the pinned
  SDK version — how the agent used `@github/copilot-sdk` to scaffold the commands, hooks,
  and manifest of this workshop
- [ ] `workshop start` scaffolds `project/issues/<N>/{research,plan,verify}.md` templates,
  writes the state file, adds `.workshop-state.json` to `.gitignore`, **and does NOT install
  hooks** — it prints the next-step prompt for `workshop install-hooks`
- [ ] `workshop install-hooks` detects existing pre-commit frameworks (Husky, pre-commit.com,
  raw `.git/hooks/pre-commit`), chains the workshop's gates after the existing chain (does
  not replace), and backs up the prior hook to `.git/hooks/<name>.workshop-backup.<unix-ts>`
- [ ] At least three computational sensors ship as installable git hooks:
  `pre-commit-research-gate`, `pre-commit-plan-gate`, `pre-pr-verify-gate`; each hook
  self-identifies in its first line (`# installed by sdd-evolution-harness-engineering
  workshop`) and prints both the failed invariant and the remediation
- [ ] At least two inferential coaches ship as agent-prompt files (e.g.,
  `post-research-coach.prompt.md`, `post-plan-2x2-sensor.prompt.md`) and are invokable via
  `workshop coach <topic>`
- [ ] `workshop diagnose 2x2` runs against the trainee's repo, classifies detected guides and
  sensors into the four 2×2 quadrants, identifies empty quadrants, offers `workshop scaffold`
  follow-ups for each empty quadrant, and supports `--json` output
- [ ] `workshop next` refuses to advance unless the current module's invariants pass; the
  failed invariants and remediations are printed
- [ ] `workshop verify` exits 0 when all invariants for completed modules pass and 1 when any
  fail; progress remaining is printed but does not produce exit 1
- [ ] `workshop override --reason "<text>"` documents and bypasses a hook for exactly one
  commit, writes a ledger entry, and the ledger is visible in `workshop status`; the next
  commit after an override is re-gated automatically
- [ ] `workshop reset` removes all workshop-installed hooks, restores any backed-up prior
  hooks, deletes the state file, and prints the list of removed paths; it is idempotent
- [ ] Outputs from `workshop scaffold adr`, `workshop scaffold core-component`, and
  `workshop onboard` are **draft candidates** carrying explicit evidence and confidence and
  are NEVER auto-accepted, auto-appended to `project/architecture/ADR/DECISION-LOG.md`, or
  auto-committed; the trainee accepts/rejects each via `workshop accept-draft <id>` /
  `workshop reject-draft <id>` before it touches canonical paths
- [ ] `workshop coach kata` records the trainee's answers verbatim and does NOT grade or
  rewrite them
- [ ] Each of the nine modules has a `modules/##-name.md` file that is **action-first**
  (≤ ~80 lines): commands to run, what the harness will enforce, debrief questions; no walls
  of prose. The verbatim narrative in Appendix A of the issue is the source of truth for
  *content*; `modules/*.md` is the source of truth for *actions*
- [ ] Module 4 ships a `workshop onboard <path>` command that walks an arbitrary repo and
  emits at least two inferred-ADR drafts and one core-component proposal for a small reference
  brownfield (as draft candidates per the pedagogical AC above)
- [ ] Module 5 ships a `workshop install-promote-ephemeral` command and a
  `pre-pr-verify-gate` hook enforcing the canonical `project/issues/<N>/` paths
- [ ] Module 7 ships a `workshop fan-out --count <n>` command that creates `<n>`
  `git worktree`s, runs RPIV against each, and reports collision points; each worktree carries
  its own state file and its own `flock`
- [ ] Closing kata is delivered via `workshop coach kata` — interactive, no-notes — and
  records the trainee's answers to the state file
- [ ] README publishes a **minute-by-minute 90-minute condensed agenda** naming the exact
  `workshop` subcommands invoked per slot and the stretch exercises explicitly skipped;
  `modules/00-baseline.md` references this agenda

### Core — state, worktrees, concurrency

- [ ] The state file lives at `<repo-root>/.workshop-state.json` where `<repo-root>` is
  `git rev-parse --show-toplevel`; the file persists `gitCommonDir`, `worktreePath`,
  `branch`, `headSha` at last checkpoint, `currentModule`, `invariantsMet`,
  `installedHooks` (with backup paths), `overrideLedger`, and `pendingScaffoldDrafts`
- [ ] All state-mutating commands hold a per-`git-common-dir` `flock`; read-only commands
  (`status`, `verify --dry-run`, `diagnose`) do not block
- [ ] `workshop status` detects state-vs-disk drift after each of: `git reset --hard`,
  `git rebase`, `git checkout <other-branch>`, `git worktree remove`, `git worktree add`,
  branch-deleted-after-PR-merge — and offers `workshop reconcile`
- [ ] Two trainees on two separate clones can run the workshop simultaneously without state
  collision (separate `git-common-dir`s → separate locks → separate state files)

### Core — repo compliance (light touch)

- [ ] `workshop.json` validates against `schemas/workshop.schema.json` with `check-jsonschema`
  exiting 0 (`difficulty: advanced`, `estimatedDuration: 3h15m`, `version: 1.0.0`,
  slug `sdd-evolution-harness-engineering`)
- [ ] `tools/registry.json` is regenerated via `scripts/rebuild-registry.sh` and contains
  the new workshop entry with POSIX-relative `path` and `manifest`
- [ ] `workshops/README.md` Advanced table replaces `*(none yet)*` with a row for this
  workshop
- [ ] `workshops/README.md` general structural description is revised to allow
  extension-driven workshops (with `extension/` + `modules/`) **in addition to** the existing
  `steps/`-style layout; both layouts are documented
- [ ] `LLM.txt` gains one line for `workshops/sdd-evolution-harness-engineering/`
- [ ] No new top-level field is added to `workshop.json`; no new repo-root convention is
  introduced. If installing the extension requires a new repo-level path, the Research stage
  flags it and the Plan stage creates an ADR (DECISION-LOG.md updated with correct date)

### Edge Cases

- [ ] A documented offline fallback entrypoint exists at
  `./workshops/sdd-evolution-harness-engineering/extension/bin/workshop` and implements every
  command listed in the Canonical Command Inventory with the documented "Offline / degraded
  behavior" (issue §2.1, §2.3)
- [ ] When the SDK is unavailable, the bash fallback prints a one-line banner identifying
  offline / degraded mode; inferential coaches degrade explicitly
  (`"inferential coaches disabled — running in degraded mode"`) rather than silently doing
  nothing
- [ ] Any command that cannot be supported offline exits non-zero with a clear message naming
  the missing capability — no silent no-ops
- [ ] `workshop reset` is idempotent: running it twice on an already-reset workshop is a
  no-op with exit 0
- [ ] Hooks self-identify on disk so trainees can find and remove them without `grep`
  archaeology
- [ ] The extension detects a previously-installed version of itself and refuses to install
  side-by-side; `--upgrade` is the sanctioned replacement path
- [ ] Uninstalling the extension via `copilot /plugin uninstall` leaves no orphan hooks or
  orphan state files
- [ ] `workshop onboard <path>` (a) resolves `<path>` with `realpath`, (b) requires
  interactive confirmation showing the resolved absolute path (skippable with `--yes`),
  (c) refuses symlink-escape from the confirmed root, (d) skips `.git`, `node_modules`,
  `vendor`, `target`, `dist`, `build`, dot-prefixed directories, and every entry in the
  target repo's `.gitignore`, (e) enforces documented size and depth limits, and (f) redacts
  secret-looking strings from any quoted evidence in scaffolded ADR drafts
- [ ] All workshop commands honour `NO_COLOR` and `TERM=dumb`
- [ ] All workshop output is also available as `--json` for screen-reader users and downstream
  tooling on at least `status`, `verify`, `diagnose`, and `help`
- [ ] No secrets (PATs, gh tokens) are written to state files, scaffolded artifacts, or any
  committed file; placeholders (`<YOUR_TOKEN>`) are used in examples
- [ ] `.workshop-state.json` is added to `.gitignore` by `workshop start` if not already
  present; the state file never contains repo file contents (paths + SHAs only)
- [ ] Stretch modules 5, 6, 7 are runnable independently — completing Module 4 is not a
  prerequisite for starting Module 6

### Testing — the harness has tests, not just hopes

- [ ] Each command in the Canonical Command Inventory (§2.1) has at least one happy-path test
- [ ] Each computational sensor (`pre-commit-research-gate`, `pre-commit-plan-gate`,
  `pre-pr-verify-gate`) has a test that fires the hook with both a passing and a failing repo
  state and asserts exit code + message
- [ ] Each inferential coach (`post-research-coach`, `post-plan-2x2-sensor`) has a
  presence-of-flagged-category test: a deliberately weak input triggers the critique; a
  concrete input does not. Exact wording is NOT asserted (LLM output varies); category
  presence is
- [ ] State machine has tests for each drift trigger: `git reset --hard` past the checkpoint,
  `git rebase`, `git checkout <other-branch>`, `git worktree remove`, `git worktree add`,
  double-`start` idempotency, `reset` cleanup, two-clones-simultaneously concurrency (lock
  test)
- [ ] Hook-chaining test: with a pre-existing pre-commit framework installed (e.g., a stub
  `pre-commit.com` setup in a fixture), `workshop install-hooks` chains the gates after the
  existing hooks and backs the prior hook up; `workshop reset` restores the backup
- [ ] Offline mode has a happy-path test that walks Module 0 → Module 2 → Module 3 using
  only the `extension/bin/workshop` bash entrypoint, with the SDK deliberately disabled; the
  test asserts the degraded-mode banner appears and computational sensors still fire
- [ ] Draft-acceptance test: `workshop scaffold adr` produces a draft file and a state-file
  entry, but DECISION-LOG.md is NOT modified until `workshop accept-draft <id>` is invoked
- [ ] `workshop onboard <path>` has a test against a small reference brownfield
  (`workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/`) and asserts the
  count + shape of inferred-ADR drafts; the test also asserts that no DECISION-LOG.md
  mutation occurred
- [ ] `workshop onboard` security tests: symlink-escape from the confirmed root is refused;
  a path with `..` traversal is refused; size-limit + depth-limit enforcement is exercised
- [ ] `check-jsonschema --schemafile schemas/workshop.schema.json
  workshops/sdd-evolution-harness-engineering/workshop.json` exits 0
- [ ] `scripts/rebuild-registry.sh` exits 0 and the rebuilt `tools/registry.json` matches
  the committed one after stripping `generatedAt`
- [ ] CI workflow `.github/workflows/validate.yml` passes on the PR branch (schemas +
  registry only; markdown link checking is a manual step)
- [ ] Manual verification — facilitator: a facilitator runs the published minute-by-minute
  90-minute condensed agenda end-to-end inside the devcontainer; every `workshop` subcommand
  the agenda invokes works as documented
- [ ] Manual verification — trainee: an unprimed trainee, given only the workshop README,
  can `copilot workshop start` (or the bash fallback) and reach Module 2 without consulting
  external docs
- [ ] Manual verification — meta: an AI agent inspecting `LLM.txt`, `tools/registry.json`,
  and `workshop.json` can describe what the workshop teaches and how to start it

---

## Proposed ADRs

> **Guardrail:** The Research stage does NOT make architectural decisions. The following are
> title-only proposals for the Plan stage to evaluate, decide, and commit.

### ADR-0004: Extension-Driven Workshop Layout Standard — REQUIRED

**Why required:** ADR-0002 (`project/architecture/ADR/ADR-0002-repository-layout-standard.md`
line 42) specifies that each workshop "must contain a … `steps/` subdirectory with numbered
step files." The new workshop uses `modules/` and `extension/` instead. This directly
contradicts the current standard. An ADR is needed to formally permit the new layout, define
when each layout is appropriate, and update `workshops/README.md` accordingly.

**Key questions for the Plan stage:**

- Whether `extension/` and `modules/` are the canonical directory names, or whether the SDK
  prescribes different names
- Whether any workshop using `@github/copilot-sdk` must follow the `extension/` layout or
  whether it is opt-in per workshop
- Whether ADR-0002 is amended in place or ADR-0004 is a new ADR that extends/supersedes the
  workshop section of ADR-0002
- Whether `workshop.json` should gain an optional `layout` field — this would require a
  schema amendment (blocked by `additionalProperties: false`) which would itself require an
  ADR, creating a dependency chain the Plan stage must unblock

**Disposition:** REQUIRED before implementation begins.

---

### ADR-0005: Copilot CLI Plugin/Extension Install Convention — CONDITIONAL

**Why potentially required:** The issue describes `copilot /plugin install` as the trainee
install step. If this command exists and requires a specific directory layout for
`extension/manifest.json`, that layout becomes a repo-level convention that future
extension-driven workshops must follow. An ADR is needed to codify it.

**Condition:** Only required if `copilot /plugin install` exists as a real CLI command in the
devcontainer's Copilot CLI at implementation time.

**If `/plugin install` does NOT exist:** This ADR is deferred. The bash fallback remains
canonical. The "installable extension" AC is marked deferred-pending-feature-availability.

**Key questions for the Plan stage:**

- Does `copilot /plugin` exist? (`copilot --help` in devcontainer)
- What schema does `extension/manifest.json` follow if `/plugin install` is real?
- Does installing a plugin create files at the repo root that introduce new layout
  conventions (which would require ADR-0005 regardless)?

**Disposition:** CONDITIONAL — Plan stage verifies `/plugin` availability first.

---

## Proposed Core-Components

### CORE-COMPONENT-0003: Workshop Harness Pattern — OPTIONAL (may defer to Plan)

**Why potentially needed:** The `.workshop-state.json` state machine, `flock` locking
convention, `extension/bin/workshop` bash entrypoint pattern, offline-mode degradation banner,
and draft-acceptance flow are conventions that future harness workshops would reuse.
Codifying them as a core-component prevents a second harness workshop from reinventing them
inconsistently.

**Proposed title:** "Workshop Harness Pattern — state machine, offline fallback, hook
chaining, and draft-acceptance conventions for extension-driven workshops"

**Disposition:** OPTIONAL for this issue. The Plan stage decides based on roadmap: if a
second harness workshop is planned in the near term, create CORE-COMPONENT-0003 before
implementation. Otherwise defer.

---

## Gaps

The following are specific unknowns the Plan stage must resolve before the Implementer begins:

1. **`copilot /plugin install` existence:** Run `copilot --help` in the devcontainer. If
   `/plugin` is not a subcommand, implementation proceeds with bash fallback as canonical
   and the "installable extension" AC is marked deferred.

2. **SDK version pinning:** Run `npm view @github/copilot-sdk version` at implementation
   time. Pin the result in `scaffold-with-copilot-sdk.md`.

3. **Node.js version:** The devcontainer's Node.js is a floating LTS tag. The Plan stage
   should document the tested version (`node --version` in devcontainer) in the task
   breakdown and in `scaffold-with-copilot-sdk.md`.

4. **`flock` availability:** Verify `which flock` in the devcontainer. If absent, an
   alternative advisory locking mechanism is needed (e.g., `lockfile -1 <path>` from
   `procmail`, or a bash PID-file approach).

5. **`extension/manifest.json` schema:** If `/plugin install` exists, the manifest schema is
   unknown from public documentation (SAML-restricted repo). The Implementer must discover
   it at implementation time and document it in `scaffold-with-copilot-sdk.md`.

6. **Brownfield test fixture design:** The Plan stage must decide the exact contents and
   commit a fixture (see §Brownfield Test Fixture Recommendation) that produces deterministic
   test results.

7. **Stretch module independence:** The AC requires stretch modules 5, 6, 7 to be runnable
   independently (without completing Module 4 first). The state machine design must define
   the transition guards for stretch modules and the Plan stage must map them out.

8. **`--upgrade` flag — where install state is persisted:** The edge-case AC requires the
   extension to detect a prior install and refuse side-by-side installation; `--upgrade` is
   the sanctioned replacement path. The Plan stage must define where install state is
   persisted (repo-local `.workshop-state.json` tracks workshop state, not install state;
   the install registry may be user-global or SDK-managed).

9. **`workshops/README.md` revised structural description:** The current description is a
   single sentence. The Plan stage must draft the revised wording covering both the `steps/`
   layout and the `extension/` + `modules/` layout unambiguously.

10. **`estimatedDuration: "3h15m"` format:** Confirm `check-jsonschema` accepts `"3h15m"` as
    a valid `minLength: 1` string (it should — no format constraint exists). If the schema
    team later adds a format constraint, this will break. No action needed now; documented
    for awareness.

---

## Risks

### Risk 1 — SDK API Instability (SEVERITY: HIGH)
`@github/copilot-sdk` is in Public Preview. APIs may be renamed, removed, or semantically
changed between implementation and when trainees run the workshop in production. The
thin-adapter wrapper the issue calls for (issue §4) mitigates this, but a significant API
change could require substantial rework of the adapter layer.

**Mitigation already specified in issue:** Thin-adapter wrapper; `scaffold-with-copilot-sdk.md`
documents the pinned version and API surface used; deprecated SDK versions print a deprecation
banner rather than silently misbehaving.

**Plan stage action:** Define the adapter interface boundary before writing any SDK calls.
All SDK calls go through the adapter; the bash fallback calls through the same interface.

---

### Risk 2 — `/plugin install` Mechanism Non-Existence (SEVERITY: HIGH)
If `copilot /plugin install` is not a real CLI command, the T+0 trainee experience described
in the issue is broken — the workshop's primary install step fails before any learning begins.
The fallback (`extension/bin/workshop`) covers functionality, but the "installable extension"
framing central to the issue's narrative is lost.

**Mitigation:** Plan stage must verify before implementation. If the command doesn't exist,
the README's T+0 experience is rewritten to use the bash fallback as canonical, and the
related AC is documented as deferred. The bash entrypoint is fully functional regardless.

---

### Risk 3 — State Machine Drift Detection (SEVERITY: HIGH)
The state machine has six drift triggers that MUST be detected (`git reset --hard`, rebase,
checkout, worktree remove, worktree add, PR merge + branch delete). Each undetected trigger
produces silent state corruption — the state file claims a module is complete when the
trainee hasn't done the work. Detecting `git rebase` (non-destructive history rewrite) and
`gh pr merge` + branch deletion reliably is non-trivial in bash.

**Mitigation:** The state machine test suite (AC: "State machine has tests for each drift
trigger") is the primary mitigation. The Plan stage must map each trigger to a concrete
detection heuristic (e.g., `git merge-base --is-ancestor <headSha> HEAD` for reset detection;
`git branch --contains <headSha>` for rebase).

---

### Risk 4 — Hook Collision with Existing Pre-commit Frameworks (SEVERITY: MEDIUM)
`workshop install-hooks` must chain its gates after any existing pre-commit framework
(Husky, pre-commit.com, raw `.git/hooks/pre-commit`). Incorrect detection may silently
overwrite an existing hook (losing the trainee's hooks) or incorrectly refuse when chaining
is feasible.

**Mitigation:** Hook-chaining test with a fixture (AC: "with a pre-existing pre-commit
framework installed…"). The Plan stage must define the three detection cases (Husky:
`.husky/` directory present; pre-commit.com: `.pre-commit-config.yaml` present; raw hook:
`.git/hooks/pre-commit` file present and executable) and their chaining strategies.

---

### Risk 5 — CI Registry Drift (SEVERITY: MEDIUM)
CI's `check-registry` job (`validate.yml` lines 37–58) diffs the rebuilt registry against the
committed one (stripping `generatedAt`). If the Implementer adds the workshop directory but
forgets to run `scripts/rebuild-registry.sh` and commit the result, CI fails. This is a
known failure mode explicitly called out in the issue's Known Pitfalls section (referencing
the issue #1 pattern).

**Mitigation:** The Verifier stage must run `scripts/rebuild-registry.sh` and validate
locally before pushing. The test plan AC for registry consistency covers this.

---

### Risk 6 — `flock` Unavailability Outside Devcontainer (SEVERITY: LOW-MEDIUM)
`flock` is standard on Linux (`util-linux`) but is not available on macOS without GNU
coreutils. Trainees running outside the devcontainer on macOS would hit `command not found`
on any state-mutating command.

**Mitigation:** The issue scopes runtime to the devcontainer. However, the bash fallback
should detect missing `flock` at startup and print a clear message rather than silently
proceeding without locking.

---

### Risk 7 — Accessibility Regressions (SEVERITY: MEDIUM)
The issue requires `NO_COLOR` + `TERM=dumb` compliance and `--json` output for `status`,
`verify`, `diagnose`, and `help`. If any ANSI escape sequences are emitted unconditionally,
or if any of the required `--json` flags is omitted, accessibility ACs fail.

**Mitigation:** Test suite must include a `NO_COLOR=1 workshop status` test asserting no
ANSI escapes in output. The `--json` flag must be implemented for all four commands before
the PR is raised.

---

### Risk 8 — Pedagogical Draft-Acceptance Bypass (SEVERITY: MEDIUM)
If the implementation accidentally auto-appends to `DECISION-LOG.md` or auto-commits a
scaffolded draft, the pedagogical contract is broken and repo state is corrupted. This is
particularly risky if the SDK's agent tooling is triggered implicitly during scaffolding.

**Mitigation:** Draft-acceptance test (AC: "`git diff project/architecture/ADR/DECISION-LOG.md`
is empty after `workshop scaffold adr`"). The state machine's `pendingScaffoldDrafts` list
is the correctness anchor — a draft is only applied to canonical paths via
`workshop accept-draft <id>`.

---

## Brownfield Test Fixture Recommendation

The AC requires `workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/` — a
small, deterministic repo against which `workshop onboard <path>` can be tested for
correctness and security.

### Recommended Structure

```
test-fixtures/brownfield/
├── README.md                   # Describes a fictional CLI tool; mentions no arch decisions
├── .gitignore                  # Standard Python .gitignore (includes __pycache__, .venv)
├── requirements.txt            # requests==2.31.0, flask==3.0.0, pytest==7.4.0
├── requirements-dev.txt        # pytest-cov==4.1.0, black==24.0.0, ruff==0.4.0
├── src/
│   ├── app.py                  # Flask app, 30-40 lines; imports requests for external API
│   ├── client.py               # HTTP client wrapper using requests; consistent error format
│   └── utils.py                # Shared utilities: logging setup, error class (reused by both)
├── tests/
│   ├── test_app.py             # 3-4 pytest tests using Flask test client
│   └── test_client.py          # 2-3 pytest tests using requests-mock
├── scripts/
│   └── lint.sh                 # Runs `ruff check .` and `black --check .`; 10 lines
└── .github/
    └── workflows/
        └── ci.yml              # Runs pytest + lint.sh on push/PR; 20 lines
```

**Deliberately absent:** No `AGENTS.md`, no `project/architecture/`, no `CONTRIBUTING.md`,
no `DECISION-LOG.md`, no existing ADRs.

### Inferrable Decisions (Expected Onboard Output)

The fixture is designed to produce at least the following inferred-ADR signals:

1. **ADR draft:** "Use Python as the primary implementation language"
   (signal: `*.py` files in `src/`, `requirements.txt`)
2. **ADR draft:** "Use Flask as the web framework"
   (signal: `flask` in `requirements.txt`, `from flask import ...` in `app.py`)
3. **ADR draft:** "Use GitHub Actions for CI"
   (signal: `.github/workflows/ci.yml`)
4. **Core-component draft:** "Consistent error handling and logging pattern"
   (signal: shared `utils.py` with a common logging setup and error class imported by both
   `app.py` and `client.py`)

### Test Assertion Shape

- Count of ADR drafts ≥ 2 (exact titles are NOT asserted — LLM-generated and may vary)
- Count of core-component proposals ≥ 1
- `DECISION-LOG.md` is NOT mutated
- No secret-looking strings appear in draft evidence (fixture contains no secrets by design)
- Size limits not exceeded (< 15 files, max depth 4 — well within defaults)

### Security Test Surface

The fixture enables the following security tests:

- Create a symlink outside `brownfield/` root → `workshop onboard` must refuse
- Pass `../` as path argument → must be refused with a clear error
- `.gitignore` contains `__pycache__/` → onboard must skip `__pycache__` directories
- Size-limit test: exceeding the configured file count limit → abort with clear message
- Depth-limit test: a directory at depth > configured max → skip with warning

---

## File Paths and Conventions Cross-Reference

| What the issue touches | File path | Constraint source |
|----------------------|-----------|-------------------|
| New workshop directory | `workshops/sdd-evolution-harness-engineering/` | ADR-0002 Decision #5 |
| Workshop manifest | `workshops/sdd-evolution-harness-engineering/workshop.json` | ADR-0003 Decision #11; `schemas/workshop.schema.json` |
| Registry update | `tools/registry.json` | ADR-0003 Decisions #16, #17 |
| Catalogue text update | `workshops/README.md` | ADR-0002 (layout docs); ADR-0004 (new layout) |
| Repo map update | `LLM.txt` | AGENTS.md convention |
| CI validation | `.github/workflows/validate.yml` | Existing; no changes needed to CI |
| Rebuild script | `scripts/rebuild-registry.sh` | ADR-0003 Decision #16 |
| State file (runtime, gitignored) | `<repo-root>/.workshop-state.json` | Issue §2.2; NOT committed |
| Module action sheets | `workshops/.../modules/00-baseline.md` … `08-closing-kata.md` | Issue §1, §3 |
| Extension package | `workshops/.../extension/` | Issue §1; ADR-0004 defines layout |
| Bash fallback entrypoint | `workshops/.../extension/bin/workshop` | Issue §2.3 |
| SDK extension manifest | `workshops/.../extension/manifest.json` | `@github/copilot-sdk`; ADR-0005 conditional |
| Hook files | `workshops/.../extension/hooks/` | Issue §1 |
| Library code | `workshops/.../extension/lib/` | Issue §1 |
| Command files | `workshops/.../extension/commands/` | Issue §1 |
| Meta-doc | `workshops/.../scaffold-with-copilot-sdk.md` | Issue §4, §6 |
| Brownfield test fixture | `workshops/.../test-fixtures/brownfield/` | Testing AC |

---

## Tech-Stack Confirmation Summary

| Requirement from issue | Available in devcontainer | Source / Notes |
|----------------------|--------------------------|----------------|
| bash (fallback entrypoint) | ✅ | Ubuntu base |
| jq (state file, registry) | ✅ | Installed in CI; Ubuntu base |
| Python / check-jsonschema | ✅ | `uv` + pip; CI installs explicitly |
| Node.js (SDK commands) | ✅ floating LTS | `ghcr.io/devcontainers/features/node` `version: "lts"` — Plan stage pins exact version |
| `flock` (advisory locking) | ✅ Likely | Ubuntu `util-linux`; Plan stage verifies with `which flock` |
| `git` (all hook operations) | ✅ | Standard Ubuntu |
| `gh` CLI (scaffold uses `gh issue create`) | ✅ | Installed devcontainer feature |
| `copilot` CLI | ✅ | Installed devcontainer feature; `/plugin` subcommand unverified |
| No new system packages | ✅ | Confirmed — all required tools present |

---

*Research complete. The Plan stage has sufficient context to:*
*(1) create ADR-0004 (required — extension-driven workshop layout);*
*(2) resolve the `/plugin install` question, which determines whether ADR-0005 is also needed;*
*(3) decide on CORE-COMPONENT-0003 (optional — harness pattern);*
*(4) design the state machine against the six drift triggers;*
*(5) design the brownfield test fixture; and*
*(6) produce a full task breakdown and test plan.*

*The one open variable — whether `copilot /plugin install` exists — is flagged explicitly*
*with a conditional decision tree. The bash fallback entrypoint is viable in all cases.*

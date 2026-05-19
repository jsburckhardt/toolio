# Research Brief: Bootstrap Toolio — Repository Structure, Tool Packaging, Discovery, and Seed Content

## GitHub Issue
- **Issue:** #1
- **Title:** feat: Bootstrap Toolio — define repository structure, tool packaging convention, discovery mechanism, and seed content

## Scope Classification
- **Scope Type:** issue

This is a feature implementation issue. It establishes foundational repository structure and conventions. While it requires multiple ADRs to capture the architectural decisions embedded within it, the work itself is deliverable as a single issue implementation — not a standalone ADR or core-component.

## Problem Statement

The `toolio` repository exists as a scaffolded shell with Soft Factory pipeline infrastructure (agents, ADRs, core-components, devcontainer) but **no actual tools, workshops, or conventions** for organizing, packaging, or discovering reusable content.

Without a defined structure:
- Contributors (human and AI) cannot know where to place a new tool, skill, or extension
- There is no metadata standard for tool discoverability
- There is no machine-readable index for programmatic discovery
- There is no training/workshop content or contribution path for it
- There is no CI validation to enforce quality standards on contributed content

This is the foundational "bootstrap" work that must happen before the repo can accept any real content. All subsequent issues will build on the structure established here.

## Existing Context

### Repository State (verified by filesystem inspection)

The following directories and files exist:

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Soft Factory pipeline spec — agent definitions, tools, guardrails, pipeline stages |
| `CONTRIBUTING.md` | RPIV pipeline contribution guide — stages, artifact locations, PR expectations |
| `LLM.txt` | Repo map for AI agents — lists all significant files for agent navigation |
| `README.md` | Minimal project overview (placeholder, APS badge present) |
| `.devcontainer/devcontainer.json` | Dev container configuration (see below) |
| `.github/agents/` | 10 APS-compliant agent instruction files (seed tool source) |
| `.github/skills/agnostic-prompt-standard/` | Full APS skill v1.2.2 with SKILL.md entrypoint |
| `project/architecture/ADR/ADR-0001-template.md` | ADR template (read-only) |
| `project/architecture/ADR/DECISION-LOG.md` | Decision log — zero ADRs, one core-component |
| `project/architecture/core-components/CORE-COMPONENT-0001-template.md` | Core-component template (read-only) |
| `project/architecture/core-components/CORE-COMPONENT-0002-commit-standards.md` | Commit Standards (Conventional Commits + Co-authored-by) |
| `project/issues/1/` | Directory exists; all subdirectories empty |

**Directories that do NOT exist (confirmed):** `tools/`, `workshops/`, `schemas/`, `scripts/`

### Devcontainer Capabilities

The devcontainer (`mcr.microsoft.com/devcontainers/base:ubuntu`) includes:

| Tool | Availability | Relevance |
|------|-------------|-----------|
| Python (via `uv`) | ✅ Installed via feature | `check-jsonschema` for schema validation |
| Node.js LTS | ✅ Installed via feature | `ajv-cli` for schema validation |
| Go (latest) | ✅ Installed via feature | Future tooling if needed |
| bash | ✅ Base Ubuntu | Registry rebuild script runtime |
| `jq` | ✅ Likely in base Ubuntu (standard package) | JSON construction in rebuild script |
| GitHub CLI (`gh`) | ✅ Installed via feature | CI and pipeline tooling |
| `just` | ✅ Installed via feature | Task runner (potential alternative to `make`) |
| Azure CLI | ✅ Installed via feature | Infrastructure tooling |
| opencode | ✅ Installed via feature | AI agent tooling |
| tmux | ✅ Installed via feature | Session management |

**Validation toolchain conclusion:** Both `check-jsonschema` (Python) and `ajv-cli` (Node.js) are available in the devcontainer. The ADR for Schema Validation Toolchain must choose one.

### Existing Agent Files (Seed Tool Source)

The `.github/agents/` directory contains 10 agent instruction files:

| File | Agent Purpose |
|------|--------------|
| `research.agent.md` | Research stage — problem exploration, scope classification |
| `planner.agent.md` | Plan stage — ADRs, core-components, task breakdown |
| `implementer.agent.md` | Implement stage — code, tests, verification |
| `verifier.agent.md` | Verify stage — tests, commits, PR creation |
| `bootstrap.agent.md` | Bootstrap new projects from Soft Factory template |
| `onboard-repo.agent.md` | Onboard existing repos into Soft Factory flow |
| `issue-generator.agent.md` | Create structured issues with acceptance criteria |
| `justdoit.agent.md` | Full RPIV pipeline in single pass for small issues |
| `aps-v1.2.2.agent.md` | APS-compliant agent/prompt file generator |
| `excali.agent.md` | Excalidraw diagram generation agent |

These files are the primary source for the `soft-factory-agents` seed tool.

### Existing APS Skill (Seed Tool Source)

The `.github/skills/agnostic-prompt-standard/` directory contains a complete APS v1.2.2 skill with:
- `SKILL.md` — entrypoint with YAML frontmatter (`name`, `description`, `license`, `metadata.*`)
- `references/` — 8 normative specification documents
- `assets/` — format/constants examples
- `processes/` — executable skill-specific workflows
- `guides/` — human/agent reference documents
- `platforms/` — platform adapters (vscode-copilot, claude-code, opencode, generic, copilot-cli)
- `_template/` — skeleton for new skill authoring

The APS SKILL.md frontmatter is the closest existing manifest pattern in the repo. The proposed `tool.json` schema should feel familiar to anyone who has read `SKILL.md`.

### Existing Decision Log

| ID | Title | Status | Date |
|----|-------|--------|------|
| CORE-COMPONENT-0002 | Commit Standards | Adopted | 2026-05-05 |

No ADRs exist. The next ADR will be **ADR-0002**. The next core-component will be **CORE-COMPONENT-0003**.

### Existing Decisions Relevant to This Issue

| # | Decision | Source |
|---|----------|--------|
| 1 | Enforce Conventional Commits v1.0.0 on every commit message | CORE-COMPONENT-0002 |
| 2 | Require Conventional Commits format on PR titles | CORE-COMPONENT-0002 |
| 3 | Require Co-authored-by trailer on all AI-authored commits | CORE-COMPONENT-0002 |

These apply directly to all commits made during implementation of this issue.

## Proposed ADRs

Four ADRs are required. They capture the architectural decisions embedded in the issue's proposed solution. The Plan stage agent must create these before implementation begins.

### ADR-0002: Repository Layout Standard

**Why needed:** The top-level directory structure (`tools/`, `workshops/`, `schemas/`, `scripts/`) is an architectural boundary. Once established, all future contributions must conform to it. Changing it later would be a breaking change requiring migration of all content. This decision must be explicitly recorded.

**Key decision points for the Plan stage:**
- Whether `registry.json` lives inside `tools/` or at the repo root
- Whether `schemas/` is a top-level directory or nested inside another
- Whether `scripts/` is used or `just` (Justfile) recipes are preferred
- Whether hidden directories (`.github/agents/`) are treated as first-class content or excluded from the tools discovery

### ADR-0003: Tool Packaging Convention

**Why needed:** The `tool.json` schema and type taxonomy define how all future tools are packaged and classified. This is the primary interface between tool authors and the discovery mechanism. The type enum (`agent-instruction`, `script`, `config`, `skill`, `extension`) must be chosen carefully and documented, as extending it later requires coordination.

**Key decision points for the Plan stage:**
- Which fields in `tool.json` are required vs. optional
- Whether the `platforms` field is required or optional
- Whether `dependencies` between tools are supported in v1 (issue says: keep flat, no nested deps)
- Whether `minAgentVersion` is included in v1 or deferred
- The exact slug pattern regex (`^[a-z0-9][a-z0-9-]*$` as proposed)
- JSON Schema Draft version (2020-12 as proposed in the issue)

### ADR-0004: Workshop Structure Standard

**Why needed:** The `workshop.json` schema and step file format define how training content is organized. The `difficulty` enum and `estimatedDuration` format must be standardized. This is separate from the tool packaging ADR because workshops have different lifecycle concerns (versioning training content vs. versioning tools).

**Key decision points for the Plan stage:**
- The `difficulty` enum values (`beginner`, `intermediate`, `advanced`)
- The `estimatedDuration` format (duration string e.g. `"2h"` or ISO 8601 duration `"PT2H"`)
- Whether workshops require a `steps/` subdirectory or can use a flat structure
- Step file naming convention (`01-introduction.md` etc.)

### ADR-0005: Schema Validation Toolchain

**Why needed:** The CI workflow and local validation require a JSON Schema validator. Both `check-jsonschema` (Python, pip-installable) and `ajv-cli` (Node.js, npx-runnable) are available in the devcontainer. This choice affects CI setup, local developer experience, and future schema features. Once CI is built around one tool, switching is costly.

**Key decision points for the Plan stage:**
- `check-jsonschema` (Python, CLI-native, Draft 2020-12 support, no config file needed) vs. `ajv-cli` (Node.js, more flexible, wider community)
- Whether validation runs via `npx` (zero-install) or requires a lockfile
- Whether to use `just` recipes or raw shell commands in CI

## Proposed Core-Components

Two core-components are required. They capture reusable cross-cutting behavioral contracts that will apply to every tool and workshop contributed to the repo.

### CORE-COMPONENT-0003: Registry Discovery

**Why needed:** The registry (`tools/registry.json`) is the machine-readable index of all tools and workshops. Its structure, generation process, and consistency requirements are cross-cutting concerns that apply to every PR that adds, modifies, or removes a tool or workshop. The rebuild script's behavior (path validation, slug sanitization, jq availability check, empty-directory handling) must be codified as a contract so all contributors and CI pipelines follow the same rules.

**Scope:** `scripts/rebuild-registry.sh`, `tools/registry.json`, CI validation of registry consistency

**Key behavioral rules to codify:**
- Registry is fully derived — never hand-edited
- Regenerated by CI on every PR; merge conflicts resolved by re-running the script
- Slug pattern enforcement (`^[a-z0-9][a-z0-9-]*$`)
- Path traversal prevention (realpath + prefix check)
- Graceful handling of empty directories (empty arrays, no error)
- Script must fail with clear error if `jq` is absent

### CORE-COMPONENT-0004: CI Validation Workflow

**Why needed:** The GitHub Actions workflow that validates `tool.json`, `workshop.json`, and registry consistency is a reusable cross-cutting concern. As new tools are contributed, every PR must pass the same validation gates. The validation contract (which checks run, what constitutes a pass/fail, how errors are reported) must be documented so contributors can run validation locally before pushing.

**Scope:** `.github/workflows/validate.yml` and any local validation scripts

**Key behavioral rules to codify:**
- Schema validation runs against `tool.schema.json` and `workshop.schema.json`
- Registry consistency check: every tool/workshop on disk must be in `registry.json` and vice versa
- CI must not fail on empty `tools/` or `workshops/` directories
- Markdown link checking runs on all READMEs
- Validation must be runnable locally (documented in CONTRIBUTING.md)

## Acceptance Criteria (from issue)

The following acceptance criteria are extracted verbatim from GitHub Issue #1.

**Core**
- [ ] A `tools/` directory exists at the repo root with a `README.md` catalogue organized by tool type
- [ ] A `workshops/` directory exists at the repo root with a `README.md` catalogue organized by difficulty
- [ ] A `schemas/` directory exists with `tool.schema.json` and `workshop.schema.json` using JSON Schema Draft 2020-12
- [ ] A `scripts/` directory exists with `rebuild-registry.sh`
- [ ] A `tools/registry.json` file exists containing both tools and workshops, conforming to a documented structure
- [ ] The `tool.json` schema enforces required fields: `name`, `displayName`, `version`, `description`, `author`, `license`, `type`, `tags`, `entrypoint`
- [ ] The `workshop.json` schema enforces required fields: `name`, `displayName`, `version`, `description`, `author`, `license`, `difficulty`, `estimatedDuration`, `prerequisites`, `objectives`
- [ ] The `type` field in `tool.json` supports at minimum: `agent-instruction`, `script`, `config`, `skill`, `extension`
- [ ] Tool slugs (folder names) conform to pattern `^[a-z0-9][a-z0-9-]*$`
- [ ] `scripts/rebuild-registry.sh` regenerates `tools/registry.json` from tool and workshop manifests on disk using bash + jq
- [ ] At least 2 seed tools exist under `tools/` with valid `tool.json` manifests and READMEs
- [ ] At least 1 seed workshop exists under `workshops/` with a valid `workshop.json`, README, and step files
- [ ] `CONTRIBUTING.md` is updated with instructions for adding new tools and workshops
- [ ] `LLM.txt` is updated to include `tools/`, `workshops/`, `schemas/`, and `scripts/` directories
- [ ] Seed tools reference existing content (`.github/agents/`, `.github/skills/`) without moving or duplicating it

**Edge Cases**
- [ ] The registry rebuild script handles zero tools (empty `tools/` directory) without error, producing an empty `tools` array
- [ ] The registry rebuild script handles zero workshops (empty `workshops/` directory) without error, producing an empty `workshops` array
- [ ] The registry rebuild script skips directories without a valid `tool.json` or `workshop.json` and emits a warning to stderr
- [ ] The registry rebuild script rejects tool/workshop slugs containing path traversal characters (`..`, `/`, `\`)
- [ ] The registry rebuild script validates resolved paths stay within the repo root (no symlink escapes)
- [ ] Schema validation rejects `tool.json` files missing required fields with clear error messages
- [ ] Schema validation rejects unknown `type` values in `tool.json`
- [ ] The registry rebuild script ignores hidden directories (`.git`, `.devcontainer`, etc.)
- [ ] `registry.json` contains only POSIX-relative paths — no absolute paths, no backslashes
- [ ] The rebuild script fails with a clear error if `jq` is not installed

**Testing**
- [ ] JSON Schema validation tests exist for `tool.schema.json` covering: valid tool, missing required field, invalid type, invalid slug pattern
- [ ] JSON Schema validation tests exist for `workshop.schema.json` covering: valid workshop, missing required field, invalid difficulty
- [ ] The registry rebuild script has tests covering: normal run, empty directories, malformed manifests, path traversal attempts, missing jq
- [ ] CI workflow (`.github/workflows/validate.yml`) runs schema validation and registry consistency checks on every PR
- [ ] All markdown files pass link checking (no broken internal links in tools/, workshops/, and root README files)

## Risks and Open Questions

### Risk 1 — jq availability in the devcontainer (Medium)
The issue assumes `jq` is available in the base Ubuntu devcontainer. The devcontainer manifest (`devcontainer.json`) does not explicitly install `jq` as a feature. While `jq` is a standard Ubuntu package and very likely present in the base image, the rebuild script must validate its presence and fail with a clear error rather than producing malformed JSON. The Plan stage should confirm `jq` availability and add an explicit installation step to `devcontainer.json` if absent.

### Risk 2 — Schema validation toolchain choice (Low-Medium)
The issue proposes two options (`check-jsonschema` or `ajv-cli`) without committing to one. ADR-0005 must make this choice before implementation. The key tradeoff: `check-jsonschema` has native CLI support and first-class Draft 2020-12 support with zero config; `ajv-cli` is more widely known in the JavaScript community but may require a config file. Given the devcontainer has both Python and Node.js, either works — but picking one now prevents CI drift.

### Risk 3 — Concurrent PR merge conflicts on registry.json (Low)
The issue acknowledges this and proposes the correct mitigation (re-run the rebuild script after merge). However, contributors who are unfamiliar with derived files may try to hand-edit `registry.json` to resolve conflicts. CONTRIBUTING.md must make the "never hand-edit registry.json" rule prominent. CORE-COMPONENT-0003 must codify this. A CI check that detects hand-edits (by verifying the registry matches what the rebuild script would produce) is strongly recommended.

### Risk 4 — Seed tool content accuracy (Low)
The seed tools reference content in `.github/agents/` and `.github/skills/` without copying it. If those source files change in a later PR, the seed tool READMEs may become stale. The seed tools should document clearly that they are pointers to live content, and their READMEs must not reproduce file contents verbatim.

### Risk 5 — LLM.txt must be updated for agent navigation (Low)
`LLM.txt` is the repo map that all agents use for navigation. It currently lists only the files present at onboarding. After this issue is implemented, `tools/`, `workshops/`, `schemas/`, `scripts/`, `tools/registry.json`, and `.github/workflows/validate.yml` must all be added. If `LLM.txt` is not updated, agents running subsequent issues will not discover the new structure. This is an explicit acceptance criterion but must be treated as a blocking deliverable, not an afterthought.

### Risk 6 — Path traversal security in rebuild script (Low, but must not be skipped)
The issue correctly identifies that the rebuild script must use `realpath` + prefix check to prevent symlink-based path traversal. This is a security requirement that must be in the test plan and verified by CI. The implementation must not skip this even though the attack surface in a public repo is low — it sets the precedent for all future scripts.

### Open Question 1 — Should `platforms` be required or optional in tool.json?
The issue shows `platforms` in the example `tool.json` but does not include it in the required fields list. The devcontainer supports vscode-copilot, claude-code, opencode, and generic platforms (per the APS skill). The Plan stage must decide whether `platforms` is required (enforcing explicit platform targeting) or optional (allowing generic tools). **Recommendation:** optional in v1, with a documented default of `["generic"]` when absent.

### Open Question 2 — Should the CI workflow also validate the rebuild script produces the current registry.json?
Beyond checking that all tools/workshops listed in `registry.json` exist on disk (and vice versa), a stricter check would be: run the rebuild script in CI and verify the output matches the committed `registry.json`. This catches cases where a contributor hand-edits the registry or where a tool.json field changes without re-running the script. **Recommendation:** implement this stricter idempotency check in CI (it is low cost and high value).

### Open Question 3 — Step file format for workshops
The issue proposes a `steps/` subdirectory with `01-introduction.md`, `02-exercise.md` naming. It does not specify whether steps have required frontmatter. ADR-0004 must decide if step files are pure markdown or require YAML frontmatter (e.g., `title`, `duration`, `type: exercise|lecture`). **Recommendation:** pure markdown in v1; frontmatter can be added later without breaking existing workshops.

### Open Question 4 — Should `schemas/__tests__/` use check-jsonschema or a test framework?
The issue mentions `schemas/__tests__/` for test fixtures but does not specify whether tests use a full test framework (pytest, vitest) or shell scripts that invoke the validator CLI. **Recommendation:** use shell scripts with the chosen CLI validator and BATS (Bash Automated Testing System) for the rebuild script tests — this keeps the test dependency footprint minimal and consistent with the bash-first approach.

### Recommendations for the Plan Stage

1. **Confirm ADR numbering:** Next ADR is ADR-0002; next core-component is CORE-COMPONENT-0003. Verify this against DECISION-LOG.md before creating any documents.
2. **Create all four ADRs before any implementation begins.** The implementation is tightly coupled to the decisions in ADR-0002 through ADR-0005.
3. **Create CORE-COMPONENT-0003 and CORE-COMPONENT-0004** to codify the registry discovery and CI validation behavioral contracts.
4. **Prioritize the rebuild script and schema files first** — the seed tools and workshops depend on the schemas being in place.
5. **Define seed tools precisely in the task breakdown:**
   - Seed Tool 1: `soft-factory-agents` (type: `agent-instruction`) — references `.github/agents/*.agent.md`
   - Seed Tool 2: `aps-skill-template` (type: `skill`) — references `.github/skills/agnostic-prompt-standard/_template/`
   - Optional Seed Tool 3: `devcontainer-toolio` (type: `config`) — references `.devcontainer/devcontainer.json`
   - Seed Workshop: `creating-your-first-tool` — walks contributor through tool creation and PR submission
6. **Confirm `jq` presence in devcontainer** before writing the rebuild script — add explicit installation if needed.
7. **Treat `LLM.txt` and `CONTRIBUTING.md` updates as blocking** (not afterthoughts) — agents depend on `LLM.txt` for navigation.
8. **Include an idempotency CI check** that runs the rebuild script and diffs against committed `registry.json`.
___BEGIN___COMMAND_DONE_MARKER___0

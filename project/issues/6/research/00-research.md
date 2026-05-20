# Research Brief: Copilot Extension — Visual Pipeline Controller for RPIV Workflow

## GitHub Issue
- **Issue:** #6
- **Title:** feat(extension): Copilot Extension — Visual Pipeline Controller for RPIV Workflow

---

## 1. Scope Classification

- **Scope Type:** `issue`

**Justification:** This is a feature implementation issue delivering a concrete, installable
tool at `tools/pipeline-controller/`. While it triggers the creation of ADR-0005 (extension-type
tool internal layout standard), the primary deliverable is source code, manifests, a bash
entrypoint, and a web-based UI. It is not itself an `architecture_decision` (a single recorded
architectural choice) nor a `core_component` (reusable cross-cutting convention). The Plan stage
will commit ADR-0005 *during* execution of this issue, but the issue's scope_type is `issue`.

---

## 2. Problem Statement

Toolio's RPIV pipeline is defined in `AGENTS.md` and documented across multiple ADRs, but
executing the pipeline against a specific GitHub issue requires a contributor to navigate
multiple files, invoke the correct agents in sequence, and enforce stage ordering manually.
There is no user-facing tool that presents the four stages (Research, Plan, Implement, Verify)
as a single visual flow, validates that each stage completes before unlocking the next, or
accepts a GitHub issue number as its sole input.

The gap is threefold:

1. **No visual orchestration layer** — a contributor wanting to run RPIV on issue #42 must
   read `AGENTS.md`, understand stage sequencing, and track progress mentally.
2. **No sequential gate enforcement** — nothing prevents jumping directly to Implement without
   a completed research brief.
3. **No extension-type tool in the catalogue** — `tool.schema.json` already supports
   `type: "extension"` (ADR-0003 Decision #12) and the registry already handles it, but no
   extension tool has been created. There is no established internal layout convention for
   extension-type tools under `tools/`.

Issue #6 addresses all three gaps by delivering a `tools/pipeline-controller/` extension with
a visual web-based UI, sequential stage gating, and a POSIX bash entrypoint runnable inside
the devcontainer.

---

## 3. Existing Architecture

### 3.1 Relevant ADRs

| ADR | Title | Applicable Decisions |
|-----|-------|---------------------|
| **ADR-0002** | Repository Layout Standard | #4 (tools under `tools/`), #6 (schemas under `schemas/`), #8 (`registry.json` inside `tools/`), #9 (hidden dirs excluded from discovery) |
| **ADR-0003** | Tool and Workshop Packaging Convention | #10 (`tool.json` required fields), #12 (`type` enum includes `extension`), #13 (slug pattern `^[a-z0-9][a-z0-9-]*$`), #14 (JSON Schema Draft 2020-12), #15 (`check-jsonschema`), #16 (rebuild via `scripts/rebuild-registry.sh`), #17 (prohibit hand-editing `registry.json`) |
| **ADR-0004** | Extension-Driven Workshop Layout Standard | #18 (two workshop layouts), #19 (offline bash entrypoint required for workshops), #20 (no writes outside workshop dir), #23 (ADR-0005 deferred — deferral condition does not apply to this issue's bash-first approach) |

**ADR-0002:** `tools/pipeline-controller/` is a valid location per Decision #4. The slug
`pipeline-controller` matches `^[a-z0-9][a-z0-9-]*$`. No ADR-0002 amendment is needed.

**ADR-0003:** `type: "extension"` is already in the `tool.schema.json` enum
(`schemas/tool.schema.json` lines 43–47). All required fields (`name`, `displayName`,
`version`, `description`, `author`, `license`, `type`, `tags`, `entrypoint`) are expressible
without schema changes. The `entrypoint` field will point to `bin/pipeline-controller`.
**No schema amendment is needed.**

**ADR-0004:** ADR-0004 defines Layout B for *workshops only*. This issue delivers a *tool*
(not a workshop), so ADR-0004 does not govern its internal structure. However, its
offline-entrypoint principle (Decision #19), no-writes-outside-own-dir rule (Decision #20),
and the ADR-0005 deferral (Decision #23) are directly relevant precedent. Decision #23 reads:
"Defer ADR-0005 (Copilot CLI plugin install convention) until `copilot /plugin install`
introduces a repo-root path." This issue's bash-first approach does not depend on
`/plugin install`, so ADR-0005 can now be created.

### 3.2 Relevant Core-Components

| Core-Component | Title | Applicable Rules |
|---------------|-------|-----------------|
| **CORE-COMPONENT-0002** | Commit Standards | Conventional Commits v1.0.0 (Decision #1), PR titles follow the format (Decision #2), Co-authored-by trailer on AI commits (Decision #3) |

### 3.3 Existing Tool Structures

*Verified by filesystem inspection of `tools/devcontainer-toolio/tool.json` and
`tools/soft-factory-agents/tool.json`.*

| Slug | Type | Entrypoint | Internal Structure |
|------|------|------------|-------------------|
| `devcontainer-toolio` | `config` | `../../.devcontainer/devcontainer.json` | `tool.json` + `README.md` only |
| `soft-factory-agents` | `agent-instruction` | `../../.github/agents/justdoit.agent.md` | `tool.json` + `README.md` only |

Both existing tools contain only `tool.json` and `README.md`, with entrypoints that reference
files outside the tool directory. An extension-type tool is fundamentally different: it ships
executable code under its own directory. **No convention currently exists** for the internal
structure of extension-type tools. This is the gap ADR-0005 must close.

### 3.4 Registry and CI Mechanics

*Verified by reading `scripts/rebuild-registry.sh` lines 51–79 and
`.github/workflows/validate.yml` lines 1–58.*

- `scripts/rebuild-registry.sh` scans `tools/*/tool.json` — adding
  `tools/pipeline-controller/tool.json` will cause it to be automatically included. No
  script changes needed.
- CI validates all `tools/*/tool.json` against `schemas/tool.schema.json` via
  `check-jsonschema`. Picks up the new manifest automatically.
- CI diffs the rebuilt registry against committed `tools/registry.json` (ignoring
  `generatedAt`). The Verifier must run `scripts/rebuild-registry.sh` and commit the result.
- **No CI configuration changes are required for this issue.**

Current registry state (`tools/registry.json` generated 2026-05-20): 2 tools, 2 workshops.
After this issue: 3 tools.

### 3.5 Devcontainer Capabilities

*Verified by reading `.devcontainer/devcontainer.json` lines 1–76.*

| Tool | Available | Relevance |
|------|-----------|-----------|
| bash | ✅ base Ubuntu | `bin/pipeline-controller` entrypoint |
| Node.js LTS (floating `"version": "lts"`) | ✅ | Optional JS; no native modules |
| Python + uv | ✅ | `check-jsonschema` validation; `python3 -m http.server` for web UI |
| GitHub CLI (`gh`) | ✅ | Issue validation (`gh issue view`); auth check (`gh auth status`) |
| Copilot CLI | ✅ | `copilot run extension pipeline-controller` — **unverified at research time** |
| jq | ✅ (Ubuntu standard; confirmed via CI apt-get) | JSON state file manipulation from bash |
| flock | ✅ likely (standard Linux `util-linux`) | Concurrent invocation locking |
| tmux | ✅ | Background server process management |

### 3.6 Precedent from Issue #4

*Verified by reading `project/issues/4/research/00-research.md` lines 1–18 and
`workshops/sdd-evolution-harness-engineering/site/` filesystem inspection.*

Issue #4 attempted a complex Copilot CLI extension with `@github/copilot-sdk` and pivoted to
a **self-contained static website** under `workshops/sdd-evolution-harness-engineering/site/`.
The pivot note states: "After implementation and review, user feedback established that the
artifact was a *tool*, not a *workshop* — it taught nothing. The final deliverable is a
**self-contained static website**."

The resulting `site/` structure is:

| File | Lines | Purpose |
|------|-------|---------|
| `site/index.html` | 182 | Module navigation and content (vanilla HTML) |
| `site/assets/styles.css` | — | Styling |
| `site/assets/app.js` | 33 | Copy buttons + active nav link (vanilla JS, zero dependencies) |

This pattern — bash entrypoint + static HTML/CSS/JS under `site/` — proved durable and simple.
It is the recommended default for the pipeline controller's visual UI.

---

## 4. Technical Research

### 4.1 `@github/copilot-sdk`

**Status:** Public Preview. Available as npm (`@github/copilot-sdk`), Python
(`github-copilot-sdk`), Go, .NET, Rust (technical preview), and Java packages.

**Architecture:** `Your Application → SDK Client → JSON-RPC → Copilot CLI (server mode)`.
The SDK is a programmatic agent runtime — it is NOT a Copilot CLI plugin packaging format.

**Key lesson from issue #4:** The SDK-based approach was abandoned in favour of a static web
site. For issue #6, the issue brief explicitly acknowledges the risk: the implementation
should be structured to work with a simple web-based UI fallback without SDK dependency.

**`copilot run extension pipeline-controller`:** This launch command appears in the issue but
is not confirmed in public Copilot CLI documentation. The devcontainer installs
`ghcr.io/devcontainers/features/copilot-cli` but whether the installed version includes a
`run extension` subcommand is **unverified at research time**. The Plan stage must verify
by running `copilot --help` in the devcontainer before assigning implementation tasks.

**SDK integration scope:** Narrow. The bash entrypoint and static web UI are the canonical
deliverable. The SDK should only be wired in if `copilot run extension` is verified and
requires it. All SDK calls, if any, go through a thin adapter so the bash fallback remains
fully functional independently.

### 4.2 Extension Pattern: Adapting ADR-0004 (Workshops) for Tools

ADR-0004 defines Layout B for workshops. The principles that transfer to tools:

| ADR-0004 Principle | Tool Equivalent |
|-------------------|----------------|
| Offline bash entrypoint is canonical (Decision #19) | `bin/<slug>` is canonical |
| No writes outside own dir at install time (Decision #20) | No writes outside `tools/<slug>/` at install time |
| Registry rebuilt only by `scripts/rebuild-registry.sh` | Unchanged |
| SDK commands layer on top of bash; they do not replace it | SDK optional; bash always works |

**Proposed ADR-0005 internal layout for extension-type tools:**


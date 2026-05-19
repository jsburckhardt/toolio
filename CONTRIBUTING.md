# Contributing to This Project

This project uses a staged pipeline to move from idea to production code. Every contribution follows the same flow.

## Pipeline Overview (RPIV)

```
Research → Plan → Implement → Verify
```

Each stage has clear inputs, outputs, and artifact locations. No stage may be skipped.

## How to Start Work on an Issue

1. **Create a GitHub Issue** describing the work to be done.
2. **Run the pipeline** — agents handle each stage in order, starting from the issue number. Agents create the documentation structure automatically under `project/issues/<ISSUE_NUMBER>/`.

## Stage 1 — Research

- The research agent fetches the GitHub Issue via `gh issue view`
- Produces `project/issues/<ISSUE_NUMBER>/research/00-research.md`
- Classifies `scope_type` as one of: `issue`, `architecture_decision`, `core_component`
- Identifies whether ADRs or core-components are needed
- References existing ADRs and core-components

## Stage 2 — Plan

- Reads the research brief before creating any architectural artifacts
- Creates ADRs in `project/architecture/ADR/` using the ADR template **when the research brief identifies them as needed**
- Creates core-components in `project/architecture/core-components/` using the core-component template **when the research brief identifies them as needed**
- Updates `project/architecture/ADR/DECISION-LOG.md` with every new ADR or core-component
- Produces `project/issues/<ISSUE_NUMBER>/plan/01-action-plan.md` with the chosen approach
- Produces `project/issues/<ISSUE_NUMBER>/plan/02-task-breakdown.md` with acceptance criteria for every task
- Produces `project/issues/<ISSUE_NUMBER>/plan/03-test-plan.md` with full test coverage requirements
- References relevant ADRs and core-components in every task

## Stage 3 — Implement

- Executes tasks from the task breakdown
- Writes tests as specified in the test plan
- Documents implementation notes in `project/issues/<ISSUE_NUMBER>/implementation/README.md`
- Deviations from ADRs or core-components require returning to the Plan stage

## Stage 4 — Verify

- Runs the full test suite and confirms all tests pass
- Creates logical, atomic commits following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Pushes to a feature branch (`<type>/<ISSUE_NUMBER>-<short-slug>`)
- Opens a pull request with `Closes #<ISSUE_NUMBER>` in the body
- Assigns the PR to Copilot for review

## Where Artifacts Belong

| Artifact | Location |
|----------|----------|
| Research briefs | `project/issues/<ISSUE_NUMBER>/research/00-research.md` |
| Action plans | `project/issues/<ISSUE_NUMBER>/plan/01-action-plan.md` |
| Task breakdowns | `project/issues/<ISSUE_NUMBER>/plan/02-task-breakdown.md` |
| Test plans | `project/issues/<ISSUE_NUMBER>/plan/03-test-plan.md` |
| Implementation notes | `project/issues/<ISSUE_NUMBER>/implementation/README.md` |
| ADRs | `project/architecture/ADR/` (global, not issue-scoped) |
| Core-Components | `project/architecture/core-components/` (global, not issue-scoped) |
| Decision log | `project/architecture/ADR/DECISION-LOG.md` |

## How to Propose ADRs and Core-Components

- **ADRs** capture architectural decisions. Copy the template from `project/architecture/ADR/ADR-0001-template.md` and create the new ADR in the same `project/architecture/ADR/` directory.
- **Core-Components** capture reusable cross-cutting behavior. Copy the template from `project/architecture/core-components/CORE-COMPONENT-0001-template.md` and create in the same `project/architecture/core-components/` directory.
- ADRs and core-components are **global** — never scoped to a single issue.
- Always update `project/architecture/ADR/DECISION-LOG.md` when adding or modifying an ADR or core-component.

## PR Expectations

- Every PR must reference the GitHub Issue it addresses (`Closes #<ISSUE_NUMBER>`)
- PR titles must follow Conventional Commits format
- ADRs and core-components must be reviewed before implementation begins
- All tests from the test plan must pass
- Implementation must not deviate from approved ADRs or core-components without going back through the Plan stage

---

## Adding a Tool

Tools are reusable packages of content (agent instructions, scripts, configs, skills, or extensions) that live under the `tools/` directory.

### Steps

1. **Choose a slug** — Must match pattern `^[a-z0-9][a-z0-9-]*$` (lowercase, numbers, hyphens only; starts with letter or digit)
2. **Create the directory** — `mkdir tools/<your-slug>`
3. **Create `tool.json`** — The manifest file with all required fields
4. **Create `README.md`** — Documentation for your tool
5. **Validate** — Run schema validation (see below)
6. **Rebuild registry** — Run `scripts/rebuild-registry.sh`
7. **Commit and PR** — Include both your tool and the updated `tools/registry.json`

### Required `tool.json` Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Slug matching `^[a-z0-9][a-z0-9-]*$` (must match folder name) |
| `displayName` | string | Human-readable name |
| `version` | string | Semantic version (e.g., `1.0.0`) |
| `description` | string | Brief description |
| `author` | string | Author or maintainer |
| `license` | string | SPDX license identifier |
| `type` | string | One of: `agent-instruction`, `script`, `config`, `skill`, `extension` |
| `tags` | array | Discovery keywords (at least one) |
| `entrypoint` | string | Relative path to the main file |

### Optional Fields

- `platforms` — Array of compatible platforms (e.g., `["vscode-copilot", "generic"]`)
- `dependencies` — Array of other tool slugs this depends on
- `minAgentVersion` — Minimum agent version required (string or null)

---

## Adding a Workshop

Workshops are hands-on learning content that live under the `workshops/` directory.

### Steps

1. **Choose a slug** — Same pattern rules as tools: `^[a-z0-9][a-z0-9-]*$`
2. **Create the directory** — `mkdir -p workshops/<your-slug>/steps`
3. **Create `workshop.json`** — The manifest file with all required fields
4. **Create `README.md`** — Overview of the workshop
5. **Create step files** — Numbered Markdown files in `steps/` (e.g., `01-introduction.md`, `02-exercise.md`)
6. **Validate** — Run schema validation
7. **Rebuild registry** — Run `scripts/rebuild-registry.sh`

### Required `workshop.json` Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Slug matching `^[a-z0-9][a-z0-9-]*$` (must match folder name) |
| `displayName` | string | Human-readable name |
| `version` | string | Semantic version |
| `description` | string | Brief description |
| `author` | string | Author or maintainer |
| `license` | string | SPDX license identifier |
| `difficulty` | string | One of: `beginner`, `intermediate`, `advanced` |
| `estimatedDuration` | string | Human-readable duration (e.g., `30m`, `2h`) |
| `prerequisites` | array | Skills or tools needed before starting |
| `objectives` | array | Learning objectives (at least one) |

### Step File Format

- Pure Markdown (no required frontmatter)
- Numbered naming convention: `01-topic.md`, `02-topic.md`, etc.
- At least one step file required

---

## Schema Validation

Validate your manifests locally using `check-jsonschema`:

```bash
# Validate a tool manifest
check-jsonschema --schemafile schemas/tool.schema.json tools/<your-slug>/tool.json

# Validate a workshop manifest
check-jsonschema --schemafile schemas/workshop.schema.json workshops/<your-slug>/workshop.json

# Validate all tools at once
check-jsonschema --schemafile schemas/tool.schema.json tools/*/tool.json

# Validate all workshops at once
check-jsonschema --schemafile schemas/workshop.schema.json workshops/*/workshop.json
```

Install `check-jsonschema` with: `pip install check-jsonschema`

---

## Registry Rebuild

The file `tools/registry.json` is a machine-readable index of all tools and workshops. **Never hand-edit `registry.json`** — it is always regenerated by the rebuild script.

### How to Rebuild

```bash
scripts/rebuild-registry.sh
```

The script:
- Scans `tools/*/tool.json` and `workshops/*/workshop.json`
- Validates slug patterns
- Prevents path traversal attacks
- Produces `tools/registry.json` with all discovered entries

### When to Rebuild

- After adding, removing, or renaming a tool or workshop
- Before committing (CI will check registry consistency)

### CI Verification

The `validate.yml` workflow runs on every PR to:
1. Validate all manifests against their schemas
2. Rebuild the registry and diff against the committed version

If the committed `registry.json` doesn't match what the script produces, the CI check will fail

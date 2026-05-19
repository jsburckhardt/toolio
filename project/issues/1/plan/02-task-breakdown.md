# Task Breakdown: Bootstrap Toolio (Issue #1)

## Task 1: Create JSON Schema Files

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** None
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create `schemas/tool.schema.json` and `schemas/workshop.schema.json` using JSON Schema Draft 2020-12. These schemas define the validation rules for tool and workshop manifests respectively. Also create `schemas/__tests__/` directory for test fixtures.

### Acceptance Criteria
- `schemas/tool.schema.json` exists and validates required fields: name, displayName, version, description, author, license, type, tags, entrypoint
- `schemas/tool.schema.json` constrains `type` to enum: agent-instruction, script, config, skill, extension
- `schemas/tool.schema.json` constrains `name` to pattern `^[a-z0-9][a-z0-9-]*$`
- `schemas/workshop.schema.json` exists and validates required fields: name, displayName, version, description, author, license, difficulty, estimatedDuration, prerequisites, objectives
- `schemas/workshop.schema.json` constrains `difficulty` to enum: beginner, intermediate, advanced
- Both schemas use `"$schema": "https://json-schema.org/draft/2020-12/schema"`
- `schemas/__tests__/` directory exists

### Test Coverage
- Valid tool.json passes validation
- tool.json missing each required field is rejected
- tool.json with invalid type value is rejected
- tool.json with invalid slug pattern is rejected
- Valid workshop.json passes validation
- workshop.json missing each required field is rejected
- workshop.json with invalid difficulty value is rejected

---

## Task 2: Create Registry Rebuild Script

- **Status:** Pending
- **Complexity:** High
- **Dependencies:** Task 1
- **Related ADRs:** ADR-0002, ADR-0003
- **Related Core-Components:** None

### Description
Create `scripts/rebuild-registry.sh` that regenerates `tools/registry.json` from tool and workshop manifests on disk. The script uses bash + jq, validates slug patterns, prevents path traversal, and handles edge cases gracefully.

### Acceptance Criteria
- `scripts/rebuild-registry.sh` exists and is executable
- Script regenerates `tools/registry.json` from `tools/*/tool.json` and `workshops/*/workshop.json`
- Script fails with clear error if `jq` is not installed
- Script produces empty `tools` and `workshops` arrays when directories are empty (no error)
- Script skips directories without valid `tool.json` or `workshop.json` and emits warning to stderr
- Script rejects slugs containing path traversal characters (`..`, `/`, `\`)
- Script validates resolved paths stay within repo root using `realpath` + prefix check
- Script ignores hidden directories (`.git`, `.devcontainer`, etc.)
- Output `registry.json` contains only POSIX-relative paths (no absolute paths, no backslashes)
- Output includes `generatedAt` timestamp in ISO 8601 format

### Test Coverage
- Normal run with valid tools and workshops produces correct registry.json
- Empty tools/ directory produces `{"tools": [], "workshops": [...]}`
- Empty workshops/ directory produces `{"tools": [...], "workshops": []}`
- Directory without tool.json is skipped with stderr warning
- Slug with `..` is rejected
- Slug with `/` or `\` is rejected
- Symlink pointing outside repo root is rejected
- Missing jq produces clear error message and non-zero exit
- Script is idempotent (running twice produces same output)

---

## Task 3: Create Directory Structure and Catalogue READMEs

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** None
- **Related ADRs:** ADR-0002
- **Related Core-Components:** None

### Description
Create the top-level directory structure (`tools/`, `workshops/`, `schemas/`, `scripts/`) with catalogue README files in `tools/` and `workshops/`.

### Acceptance Criteria
- `tools/README.md` exists with a catalogue template organized by tool type (agent-instruction, script, config, skill, extension)
- `workshops/README.md` exists with a catalogue template organized by difficulty (beginner, intermediate, advanced)
- `schemas/` directory exists
- `scripts/` directory exists
- All READMEs use valid Markdown with no broken links

### Test Coverage
- Directories exist at expected paths
- READMEs are valid Markdown
- No broken internal links in READMEs

---

## Task 4: Create Seed Tool — soft-factory-agents

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1, Task 3
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create `tools/soft-factory-agents/` with a valid `tool.json` manifest (type: `agent-instruction`) and a `README.md`. This tool references the 10 agent instruction files in `.github/agents/` without copying or moving them.

### Acceptance Criteria
- `tools/soft-factory-agents/tool.json` exists and passes schema validation
- `tool.json` has type `agent-instruction` and entrypoint pointing to a valid file
- `tools/soft-factory-agents/README.md` exists describing the tool's purpose, contents, and usage
- README references `.github/agents/*.agent.md` files by relative path
- Tool does NOT duplicate content from `.github/agents/`
- Slug `soft-factory-agents` matches pattern `^[a-z0-9][a-z0-9-]*$`

### Test Coverage
- tool.json validates against schemas/tool.schema.json
- README contains no broken relative links
- Entrypoint file exists at the referenced path

---

## Task 5: Create Seed Tool — devcontainer-toolio

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** Task 1, Task 3
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create `tools/devcontainer-toolio/` with a valid `tool.json` manifest (type: `config`) and a `README.md`. This tool references the devcontainer configuration in `.devcontainer/`.

### Acceptance Criteria
- `tools/devcontainer-toolio/tool.json` exists and passes schema validation
- `tool.json` has type `config` and entrypoint referencing `.devcontainer/devcontainer.json`
- `tools/devcontainer-toolio/README.md` exists describing the devcontainer features and usage
- Tool does NOT duplicate content from `.devcontainer/`
- Slug `devcontainer-toolio` matches pattern `^[a-z0-9][a-z0-9-]*$`

### Test Coverage
- tool.json validates against schemas/tool.schema.json
- README contains no broken relative links
- Entrypoint file exists at the referenced path

---

## Task 6: Create Seed Workshop — creating-your-first-tool

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1, Task 3
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create `workshops/creating-your-first-tool/` with a valid `workshop.json` manifest (difficulty: `beginner`), a `README.md`, and a `steps/` subdirectory with numbered step files that walk a contributor through creating and submitting a new tool.

### Acceptance Criteria
- `workshops/creating-your-first-tool/workshop.json` exists and passes schema validation
- `workshop.json` has difficulty `beginner` and all required fields populated
- `workshops/creating-your-first-tool/README.md` exists with workshop overview
- `workshops/creating-your-first-tool/steps/` directory exists with at least 3 step files
- Step files follow naming convention: `01-*.md`, `02-*.md`, `03-*.md`
- Step files are pure Markdown (no required frontmatter)
- Slug `creating-your-first-tool` matches pattern `^[a-z0-9][a-z0-9-]*$`

### Test Coverage
- workshop.json validates against schemas/workshop.schema.json
- README contains no broken relative links
- Steps directory contains at least one numbered file
- Step files are valid Markdown

---

## Task 7: Generate Registry

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** Task 2, Task 4, Task 5, Task 6
- **Related ADRs:** ADR-0002, ADR-0003
- **Related Core-Components:** None

### Description
Run `scripts/rebuild-registry.sh` to generate `tools/registry.json` containing all seed tools and the seed workshop.

### Acceptance Criteria
- `tools/registry.json` exists and is valid JSON
- Registry contains entries for `soft-factory-agents` and `devcontainer-toolio` in `tools` array
- Registry contains entry for `creating-your-first-tool` in `workshops` array
- All paths in registry are POSIX-relative
- `generatedAt` field contains valid ISO 8601 timestamp
- Running the script again produces identical output (idempotent)

### Test Coverage
- registry.json is valid JSON
- registry.json contains expected tool entries
- registry.json contains expected workshop entries
- Running rebuild-registry.sh produces output matching committed registry.json

---

## Task 8: Update CONTRIBUTING.md

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1, Task 2, Task 3
- **Related ADRs:** ADR-0002, ADR-0003
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Add a section to `CONTRIBUTING.md` with instructions for adding new tools and workshops, including manifest creation, slug naming rules, schema validation commands, and registry rebuild instructions.

### Acceptance Criteria
- CONTRIBUTING.md contains a "Adding Tools" section explaining tool creation process
- CONTRIBUTING.md contains a "Adding Workshops" section explaining workshop creation process
- Instructions include how to validate manifests locally using `check-jsonschema`
- Instructions state that `registry.json` must never be hand-edited
- Instructions include how to run `scripts/rebuild-registry.sh`
- Slug naming pattern `^[a-z0-9][a-z0-9-]*$` is documented
- Required fields for both `tool.json` and `workshop.json` are listed

### Test Coverage
- CONTRIBUTING.md is valid Markdown
- No broken internal links
- All referenced commands/paths exist in the repo

---

## Task 9: Update LLM.txt

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** Task 3, Task 4, Task 5, Task 6, Task 7
- **Related ADRs:** ADR-0002
- **Related Core-Components:** None

### Description
Update `LLM.txt` to include entries for all new directories and key files so AI agents can navigate the repository.

### Acceptance Criteria
- LLM.txt includes entries for: `tools/`, `tools/registry.json`, `tools/README.md`
- LLM.txt includes entries for: `workshops/`, `workshops/README.md`
- LLM.txt includes entries for: `schemas/tool.schema.json`, `schemas/workshop.schema.json`
- LLM.txt includes entries for: `scripts/rebuild-registry.sh`
- LLM.txt includes entry for: `.github/workflows/validate.yml`
- Each entry has a brief description of purpose

### Test Coverage
- All paths listed in LLM.txt exist in the repository
- No duplicate entries

---

## Task 10: Create CI Validation Workflow

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1, Task 2
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create `.github/workflows/validate.yml` that runs on every PR to validate tool.json and workshop.json files against their schemas, verify registry consistency (idempotency check), and check for broken Markdown links.

### Acceptance Criteria
- `.github/workflows/validate.yml` exists and is valid GitHub Actions YAML
- Workflow triggers on pull_request events
- Workflow installs `check-jsonschema` and validates all `tool.json` files against `schemas/tool.schema.json`
- Workflow validates all `workshop.json` files against `schemas/workshop.schema.json`
- Workflow runs `scripts/rebuild-registry.sh` and diffs output against committed `tools/registry.json`
- Workflow does not fail on empty `tools/` or `workshops/` directories
- Workflow is runnable locally (commands documented in CONTRIBUTING.md)

### Test Coverage
- YAML is valid (parseable)
- Workflow references correct schema paths
- Workflow references correct script paths
- Manual execution of the same commands locally produces expected results

---

## Task 11: Create Schema Test Fixtures

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create test fixtures in `schemas/__tests__/` that verify schema validation behavior for both valid and invalid manifests. Use shell scripts that invoke `check-jsonschema` to run the tests.

### Acceptance Criteria
- `schemas/__tests__/valid-tool.json` exists and passes validation
- `schemas/__tests__/invalid-tool-missing-field.json` exists and fails validation
- `schemas/__tests__/invalid-tool-bad-type.json` exists and fails validation
- `schemas/__tests__/invalid-tool-bad-slug.json` exists and fails validation
- `schemas/__tests__/valid-workshop.json` exists and passes validation
- `schemas/__tests__/invalid-workshop-missing-field.json` exists and fails validation
- `schemas/__tests__/invalid-workshop-bad-difficulty.json` exists and fails validation
- `schemas/__tests__/run-tests.sh` exists, is executable, and reports pass/fail for each fixture

### Test Coverage
- Each valid fixture passes schema validation
- Each invalid fixture fails schema validation with appropriate error
- run-tests.sh exits 0 when all checks pass
- run-tests.sh exits non-zero when any check fails

---

## Task 12: Create Rebuild Script Tests

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 2
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Create tests for `scripts/rebuild-registry.sh` covering normal operation, edge cases, and security scenarios. Use bash test scripts (or BATS if available).

### Acceptance Criteria
- Test script exists at `scripts/__tests__/test-rebuild-registry.sh`
- Tests cover: normal run with valid tools produces correct output
- Tests cover: empty tools/ directory produces empty tools array
- Tests cover: empty workshops/ directory produces empty workshops array
- Tests cover: directory without manifest is skipped with warning
- Tests cover: slug with path traversal characters is rejected
- Tests cover: symlink escaping repo root is rejected
- Tests cover: missing jq produces error
- Tests cover: script is idempotent
- All tests pass in the devcontainer environment

### Test Coverage
- Every edge case from the acceptance criteria in Issue #1 is covered
- Tests are self-contained and can run in CI
- Tests clean up any temporary fixtures they create

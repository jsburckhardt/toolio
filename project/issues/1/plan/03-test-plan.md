# Test Plan: Bootstrap Toolio (Issue #1)

## Test T1: Tool Schema Validates Correct Manifest

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Install `check-jsonschema` via pip/uv
- Create `schemas/__tests__/valid-tool.json` with all required fields and valid values

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json schemas/__tests__/valid-tool.json`

### Expected Result
- Exit code 0
- No validation errors

---

## Test T2: Tool Schema Rejects Missing Required Fields

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/invalid-tool-missing-field.json` — a tool.json with `description` field removed

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json schemas/__tests__/invalid-tool-missing-field.json`

### Expected Result
- Exit code non-zero
- Error message mentions missing required property

---

## Test T3: Tool Schema Rejects Invalid Type

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/invalid-tool-bad-type.json` with `"type": "unknown-type"`

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json schemas/__tests__/invalid-tool-bad-type.json`

### Expected Result
- Exit code non-zero
- Error message indicates invalid enum value for `type`

---

## Test T4: Tool Schema Rejects Invalid Slug Pattern

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/invalid-tool-bad-slug.json` with `"name": "Invalid_Tool"`

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json schemas/__tests__/invalid-tool-bad-slug.json`

### Expected Result
- Exit code non-zero
- Error message indicates pattern mismatch on `name`

---

## Test T5: Workshop Schema Validates Correct Manifest

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/valid-workshop.json` with all required fields and valid values

### Steps
1. Run `check-jsonschema --schemafile schemas/workshop.schema.json schemas/__tests__/valid-workshop.json`

### Expected Result
- Exit code 0
- No validation errors

---

## Test T6: Workshop Schema Rejects Missing Required Fields

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/invalid-workshop-missing-field.json` with `objectives` removed

### Steps
1. Run `check-jsonschema --schemafile schemas/workshop.schema.json schemas/__tests__/invalid-workshop-missing-field.json`

### Expected Result
- Exit code non-zero
- Error message mentions missing required property

---

## Test T7: Workshop Schema Rejects Invalid Difficulty

- **Type:** Unit (schema validation)
- **Task:** Task 1, Task 11
- **Priority:** High

### Setup
- Create `schemas/__tests__/invalid-workshop-bad-difficulty.json` with `"difficulty": "expert"`

### Steps
1. Run `check-jsonschema --schemafile schemas/workshop.schema.json schemas/__tests__/invalid-workshop-bad-difficulty.json`

### Expected Result
- Exit code non-zero
- Error message indicates invalid enum value for `difficulty`

---

## Test T8: Rebuild Script Normal Run

- **Type:** Integration
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Seed tools and workshop already created (Tasks 4-6)
- `jq` is installed

### Steps
1. Run `bash scripts/rebuild-registry.sh`
2. Parse `tools/registry.json` with `jq`

### Expected Result
- Exit code 0
- `tools/registry.json` is valid JSON
- `.tools` array contains entries for `soft-factory-agents` and `devcontainer-toolio`
- `.workshops` array contains entry for `creating-your-first-tool`
- All paths are POSIX-relative (no leading `/`, no `\`)
- `generatedAt` field is present and valid ISO 8601

---

## Test T9: Rebuild Script Handles Empty Tools Directory

- **Type:** Integration
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Temporary state with empty `tools/` directory (no subdirectories with tool.json)

### Steps
1. Run `bash scripts/rebuild-registry.sh` with no tool subdirectories present

### Expected Result
- Exit code 0
- `.tools` array in output is empty `[]`
- No error messages on stderr (warnings are acceptable for empty state)

---

## Test T10: Rebuild Script Handles Empty Workshops Directory

- **Type:** Integration
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Temporary state with empty `workshops/` directory

### Steps
1. Run `bash scripts/rebuild-registry.sh` with no workshop subdirectories present

### Expected Result
- Exit code 0
- `.workshops` array in output is empty `[]`

---

## Test T11: Rebuild Script Skips Directories Without Manifest

- **Type:** Integration
- **Task:** Task 2, Task 12
- **Priority:** Medium

### Setup
- Create a directory `tools/no-manifest/` with a README.md but no tool.json

### Steps
1. Run `bash scripts/rebuild-registry.sh`
2. Check stderr output
3. Check registry.json does not include `no-manifest`

### Expected Result
- Exit code 0
- Warning emitted to stderr mentioning the skipped directory
- `no-manifest` does not appear in registry.json

---

## Test T12: Rebuild Script Rejects Path Traversal in Slug

- **Type:** Security
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Attempt to create directory with `..` in name (may need to test via script logic rather than actual directory creation)

### Steps
1. Simulate or create a slug containing `..`
2. Run `bash scripts/rebuild-registry.sh`

### Expected Result
- Slug is rejected
- Warning/error emitted to stderr
- Entry does NOT appear in registry.json

---

## Test T13: Rebuild Script Rejects Symlink Escape

- **Type:** Security
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Create a symlink in `tools/` pointing to a directory outside the repo root (e.g., `/tmp/evil-tool`)

### Steps
1. Create symlink: `ln -s /tmp/evil-tool tools/evil-link`
2. Run `bash scripts/rebuild-registry.sh`

### Expected Result
- Symlinked directory is rejected (realpath check fails prefix validation)
- Warning emitted to stderr
- Entry does NOT appear in registry.json

---

## Test T14: Rebuild Script Fails Without jq

- **Type:** Integration
- **Task:** Task 2, Task 12
- **Priority:** High

### Setup
- Temporarily make `jq` unavailable (rename or use PATH manipulation)

### Steps
1. Run `bash scripts/rebuild-registry.sh` without jq in PATH

### Expected Result
- Exit code non-zero
- Clear error message stating jq is required

---

## Test T15: Rebuild Script Idempotency

- **Type:** Integration
- **Task:** Task 2, Task 7, Task 12
- **Priority:** Medium

### Setup
- Seed tools and workshop present
- registry.json already generated

### Steps
1. Run `bash scripts/rebuild-registry.sh`
2. Save output hash
3. Run `bash scripts/rebuild-registry.sh` again
4. Compare output hash

### Expected Result
- Both runs produce byte-identical registry.json (excluding generatedAt if timestamp changes — test should account for this or use fixed timestamp option)

---

## Test T16: Seed Tool Manifests Pass Validation

- **Type:** Integration
- **Task:** Task 4, Task 5
- **Priority:** High

### Setup
- schemas/tool.schema.json exists
- Seed tools created

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json tools/soft-factory-agents/tool.json`
2. Run `check-jsonschema --schemafile schemas/tool.schema.json tools/devcontainer-toolio/tool.json`

### Expected Result
- Both commands exit 0
- No validation errors

---

## Test T17: Seed Workshop Manifest Passes Validation

- **Type:** Integration
- **Task:** Task 6
- **Priority:** High

### Setup
- schemas/workshop.schema.json exists
- Seed workshop created

### Steps
1. Run `check-jsonschema --schemafile schemas/workshop.schema.json workshops/creating-your-first-tool/workshop.json`

### Expected Result
- Exit code 0
- No validation errors

---

## Test T18: CI Workflow Validates Correctly

- **Type:** Integration (manual/CI)
- **Task:** Task 10
- **Priority:** Medium

### Setup
- `.github/workflows/validate.yml` exists
- All schemas, tools, workshops, and scripts in place

### Steps
1. Verify YAML is valid: `python -c "import yaml; yaml.safe_load(open('.github/workflows/validate.yml'))"`
2. Manually run the commands from the workflow locally:
   - `check-jsonschema --schemafile schemas/tool.schema.json tools/*/tool.json`
   - `check-jsonschema --schemafile schemas/workshop.schema.json workshops/*/workshop.json`
   - `bash scripts/rebuild-registry.sh && diff <(cat tools/registry.json) <(bash scripts/rebuild-registry.sh)`

### Expected Result
- YAML is parseable
- All local commands pass
- Registry idempotency check passes

---

## Test T19: LLM.txt Contains All New Entries

- **Type:** Verification
- **Task:** Task 9
- **Priority:** Medium

### Setup
- LLM.txt updated

### Steps
1. Check LLM.txt contains entries for: tools/, tools/registry.json, tools/README.md, workshops/, workshops/README.md, schemas/tool.schema.json, schemas/workshop.schema.json, scripts/rebuild-registry.sh, .github/workflows/validate.yml

### Expected Result
- All entries present with descriptions
- All referenced paths exist on disk

---

## Test T20: CONTRIBUTING.md Contains Tool/Workshop Guide

- **Type:** Verification
- **Task:** Task 8
- **Priority:** Medium

### Setup
- CONTRIBUTING.md updated

### Steps
1. Check CONTRIBUTING.md contains section on adding tools
2. Check CONTRIBUTING.md contains section on adding workshops
3. Check that `check-jsonschema` validation command is documented
4. Check that "never hand-edit registry.json" rule is present
5. Check that slug pattern is documented

### Expected Result
- All sections present
- Commands are accurate and runnable
- No broken internal links

---

## Test T21: Markdown Link Integrity

- **Type:** Verification
- **Task:** Task 3, Task 4, Task 5, Task 6, Task 8, Task 9
- **Priority:** Medium

### Setup
- All Markdown files created/updated

### Steps
1. Check all relative links in `tools/README.md`, `workshops/README.md`, seed tool READMEs, seed workshop README, CONTRIBUTING.md
2. Verify each referenced path exists

### Expected Result
- No broken internal links in any Markdown file

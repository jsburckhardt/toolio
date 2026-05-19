# Action Plan: Bootstrap Toolio

## Feature
- **ID:** 1
- **Research Brief:** project/issues/1/research/00-research.md

## ADRs Created
- **ADR-0002** — Repository Layout Standard: defines top-level directory structure (tools/, workshops/, schemas/, scripts/)
- **ADR-0003** — Tool and Workshop Packaging Convention: defines tool.json/workshop.json schemas, type taxonomy, slug naming, registry structure, rebuild mechanism, and validation toolchain

## Core-Components Created
- None (commit standards already covered by CORE-COMPONENT-0002; registry discovery and CI validation contracts are captured within the ADRs for v1)

## Implementation Tasks

### Phase 1: Foundation (schemas and scripts)
1. Create JSON Schema files (`tool.schema.json`, `workshop.schema.json`) in `schemas/`
2. Create `scripts/rebuild-registry.sh` with path traversal protection and jq dependency check
3. Create directory structure with placeholder READMEs (`tools/README.md`, `workshops/README.md`)

### Phase 2: Seed Content
4. Create seed tool: `soft-factory-agents` (type: agent-instruction)
5. Create seed tool: `devcontainer-toolio` (type: config)
6. Create seed workshop: `creating-your-first-tool` (type: beginner)
7. Run `rebuild-registry.sh` to generate `tools/registry.json`

### Phase 3: Documentation and CI
8. Update `CONTRIBUTING.md` with tool/workshop contribution guide
9. Update `LLM.txt` with new directories and files
10. Create `.github/workflows/validate.yml` CI workflow

### Phase 4: Testing
11. Create schema validation test fixtures in `schemas/__tests__/`
12. Create rebuild script tests (bash/BATS)

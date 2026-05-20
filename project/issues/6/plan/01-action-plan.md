# Action Plan: Copilot Extension — Visual Pipeline Controller for RPIV Workflow

## Feature
- **ID:** 6
- **Research Brief:** project/issues/6/research/00-research.md

## ADRs Created
- **ADR-0005** — Extension-Type Tool Internal Layout Standard (`project/architecture/ADR/ADR-0005-extension-type-tool-internal-layout.md`)

## Core-Components Created
- None (no new cross-cutting concern identified; existing CORE-COMPONENT-0002 Commit Standards applies)

## Implementation Tasks

### Phase 1: Tool Skeleton & Manifest
1. **Task 1** — Create `tools/pipeline-controller/` directory structure with `tool.json`, `README.md`, and `bin/pipeline-controller` entrypoint stub
2. **Task 2** — Implement `lib/state.sh` — bash helpers for reading/writing `.pipeline-state.json` via `jq`

### Phase 2: Entrypoint Logic
3. **Task 3** — Implement full `bin/pipeline-controller` entrypoint: argument parsing, `gh auth` check, issue validation, state initialization, HTTP server launch, browser open

### Phase 3: Web UI
4. **Task 4** — Create `site/index.html` — 4-stage pipeline card layout with status indicators
5. **Task 5** — Create `site/assets/styles.css` — card styling, status colours (locked/ready/running/done/failed)
6. **Task 6** — Create `site/assets/app.js` — vanilla JS FSM client: 2-second polling, card render, stage transitions

### Phase 4: Integration & Registry
7. **Task 7** — Run `scripts/rebuild-registry.sh` to update `tools/registry.json` with the new tool
8. **Task 8** — Validate all manifests pass `check-jsonschema` and entrypoint is functional end-to-end

### Dependency Order
```
Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8
                                 ↗ (Tasks 4,5,6 can parallelize after Task 3)
```

### Key Design Decisions
- **State machine**: 5 states (`locked`, `ready`, `running`, `done`, `failed`), 4 stages (Research, Plan, Implement, Verify)
- **State file**: `.pipeline-state.json` written to repo root at runtime (per ADR-0005 Decision #28)
- **Serving**: `python3 -m http.server 8080` from `site/` directory (per ADR-0005 Decision #30)
- **Polling**: Client-side 2-second `fetch()` to read state file served alongside HTML
- **Sequential gating**: Stage N+1 unlocks only when stage N reaches `done`

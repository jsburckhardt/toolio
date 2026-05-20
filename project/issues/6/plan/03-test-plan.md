# Test Plan: Issue #6 — Visual Pipeline Controller

## Test T1: Tool manifest schema validation

- **Type:** Automated / CI
- **Task:** Task 1
- **Priority:** High

### Setup
- Ensure `check-jsonschema` is installed (`uv tool install check-jsonschema` or pip)
- `tools/pipeline-controller/tool.json` exists

### Steps
1. Run `check-jsonschema --schemafile schemas/tool.schema.json tools/pipeline-controller/tool.json`
2. Verify exit code is 0

### Expected Result
- Command exits 0 with no errors
- `tool.json` is fully compliant with the tool schema

---

## Test T2: Entrypoint executable and shellcheck

- **Type:** Automated / CI
- **Task:** Task 1, Task 3
- **Priority:** High

### Setup
- `shellcheck` available in devcontainer
- `tools/pipeline-controller/bin/pipeline-controller` exists

### Steps
1. Run `test -x tools/pipeline-controller/bin/pipeline-controller` — verify executable bit
2. Run `shellcheck tools/pipeline-controller/bin/pipeline-controller` — verify no warnings
3. Run `shellcheck tools/pipeline-controller/lib/state.sh` — verify no warnings
4. Verify shebang is `#!/usr/bin/env bash`

### Expected Result
- All files have executable bit set (bin/ only)
- Shellcheck reports 0 errors and 0 warnings
- Shebang line is correct

---

## Test T3: State management unit tests

- **Type:** Unit (bash)
- **Task:** Task 2
- **Priority:** High

### Setup
- Create a temporary working directory
- Source `tools/pipeline-controller/lib/state.sh`
- Ensure `jq` is available

### Steps
1. Call `state_init 42`
2. Verify `.pipeline-state.json` exists and is valid JSON (`jq empty`)
3. Verify `state_get_stage research` returns `ready`
4. Verify `state_get_stage plan` returns `locked`
5. Verify `state_get_stage implement` returns `locked`
6. Verify `state_get_stage verify` returns `locked`
7. Call `state_set_stage research running`
8. Verify `state_get_stage research` returns `running`
9. Call `state_set_stage research done`
10. Verify `state_get_stage plan` returns `ready` (gating logic)
11. Verify `state_get_stage implement` remains `locked`

### Expected Result
- All assertions pass
- State file is valid JSON after every operation
- Gating logic correctly promotes next stage on `done`

---

## Test T4: Entrypoint argument parsing and validation

- **Type:** Integration
- **Task:** Task 3
- **Priority:** High

### Setup
- Valid `gh` authentication in devcontainer
- Known-valid issue number (e.g., 6)

### Steps
1. Run `bin/pipeline-controller` with no arguments — expect non-zero exit and usage message
2. Run `bin/pipeline-controller 99999` (invalid issue) — expect non-zero exit and error
3. Run `bin/pipeline-controller 6 --port 9999` — expect server start on 9999
4. Verify `.pipeline-state.json` created in working directory
5. Send SIGINT — verify clean shutdown (no orphan `python3` process)

### Expected Result
- Missing args: exit 1 with usage text
- Invalid issue: exit 1 with descriptive error
- Valid invocation: server starts, state file created, clean shutdown

---

## Test T5: HTTP server serves site correctly

- **Type:** Integration
- **Task:** Task 3, Task 4
- **Priority:** High

### Setup
- Launch `bin/pipeline-controller 6 --port 8181` in background
- Wait 2 seconds for server startup

### Steps
1. `curl -s -o /dev/null -w "%{http_code}" http://localhost:8181/` — expect `200`
2. `curl -s http://localhost:8181/` — expect HTML containing `stage-research`
3. `curl -s http://localhost:8181/assets/styles.css` — expect 200
4. `curl -s http://localhost:8181/assets/app.js` — expect 200
5. Kill background process

### Expected Result
- All resources return HTTP 200
- HTML contains the 4 stage card IDs
- CSS and JS files are served correctly

---

## Test T6: State file structure validation

- **Type:** Unit
- **Task:** Task 2, Task 3
- **Priority:** Medium

### Setup
- Launch controller for issue 6, then immediately read state file

### Steps
1. Parse `.pipeline-state.json` with `jq`
2. Verify top-level fields: `issue`, `stages`, `createdAt`
3. Verify `issue` equals `6`
4. Verify `stages` is an array of 4 objects
5. Verify each stage has `id`, `name`, `status` fields
6. Verify stage IDs are `research`, `plan`, `implement`, `verify` in order
7. Verify first stage status is `ready`, rest are `locked`

### Expected Result
- State file conforms to expected schema
- Initial state is correct per FSM specification

---

## Test T7: Web UI static analysis

- **Type:** Static analysis
- **Task:** Task 4, Task 5, Task 6
- **Priority:** Medium

### Setup
- Files exist: `site/index.html`, `site/assets/styles.css`, `site/assets/app.js`

### Steps
1. Verify `index.html` contains no external URLs (grep for `https://` excluding localhost)
2. Verify `styles.css` contains all 5 status classes: `status-locked`, `status-ready`, `status-running`, `status-done`, `status-failed`
3. Verify `styles.css` contains `@media` query
4. Verify `app.js` contains `'use strict'`
5. Verify `app.js` contains `fetch` call
6. Verify `app.js` contains polling mechanism (`setInterval` or similar)
7. Verify no `import` from external URLs in any file

### Expected Result
- All static checks pass
- No external dependencies detected
- All required CSS classes defined
- JS uses strict mode and implements polling

---

## Test T8: Registry rebuild includes pipeline-controller

- **Type:** Integration
- **Task:** Task 7
- **Priority:** High

### Setup
- `tools/pipeline-controller/tool.json` exists and is valid
- `jq` available

### Steps
1. Run `scripts/rebuild-registry.sh`
2. Verify exit code 0
3. Parse `tools/registry.json` with `jq`
4. Verify `.tools | length` equals 3
5. Verify `.tools[] | select(.slug == "pipeline-controller")` exists
6. Verify the entry has `"path": "tools/pipeline-controller"` and `"manifest": "tools/pipeline-controller/tool.json"`

### Expected Result
- Registry regenerated successfully
- Contains 3 tools including `pipeline-controller`
- Entry fields are correct

---

## Test T9: Write boundary enforcement

- **Type:** Integration
- **Task:** Task 8
- **Priority:** High

### Setup
- Clean working directory (git status clean)
- Launch and stop the controller

### Steps
1. Record file list inside `tools/pipeline-controller/` before launch
2. Launch `bin/pipeline-controller 6`, wait for state file creation
3. Kill controller
4. Record file list inside `tools/pipeline-controller/` after shutdown
5. Compare: verify no new files inside `tools/pipeline-controller/`
6. Verify `.pipeline-state.json` exists in repo root (working directory)
7. Clean up `.pipeline-state.json`

### Expected Result
- Zero files added to `tools/pipeline-controller/` at runtime
- State file written only to working directory (repo root)
- ADR-0005 write boundary rules upheld

---

## Test T10: End-to-end smoke test

- **Type:** End-to-end
- **Task:** Task 8
- **Priority:** Critical

### Setup
- Full devcontainer environment
- Valid `gh` auth
- Issue #6 exists

### Steps
1. `cd $(git rev-parse --show-toplevel)`
2. `tools/pipeline-controller/bin/pipeline-controller 6 --port 8282 &`
3. Wait 3 seconds
4. Verify `.pipeline-state.json` exists and is valid JSON
5. `curl -s http://localhost:8282/` — verify contains `stage-research`
6. Verify state shows research=ready, plan/implement/verify=locked
7. Kill background process
8. Verify no orphan python3 processes on port 8282
9. Remove `.pipeline-state.json`

### Expected Result
- Full pipeline controller lifecycle works end-to-end
- State is correct, UI is served, shutdown is clean
- No resource leaks

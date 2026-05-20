# Task Breakdown: Issue #6 — Visual Pipeline Controller

## Task 1: Create tool skeleton and manifest

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** None
- **Related ADRs:** ADR-0003, ADR-0005
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Create the `tools/pipeline-controller/` directory with the required ADR-0005 structure:
- `tool.json` manifest with `type: "extension"` and `entrypoint: "bin/pipeline-controller"`
- `README.md` with launch instructions, prerequisites, and usage
- `bin/pipeline-controller` as an executable stub (`#!/usr/bin/env bash`, `set -euo pipefail`, placeholder exit 0)
- Empty `lib/` and `site/assets/` directories

### Acceptance Criteria
- [ ] `tools/pipeline-controller/tool.json` exists and passes `check-jsonschema --schemafile schemas/tool.schema.json`
- [ ] `tool.json` has `"type": "extension"` and `"entrypoint": "bin/pipeline-controller"`
- [ ] `bin/pipeline-controller` is executable (`chmod +x`) and starts with `#!/usr/bin/env bash`
- [ ] `README.md` documents how to launch the tool
- [ ] Directory structure matches ADR-0005 layout

### Test Coverage
- Schema validation: `check-jsonschema --schemafile schemas/tool.schema.json tools/pipeline-controller/tool.json`
- Executable bit check: `test -x tools/pipeline-controller/bin/pipeline-controller`
- Shellcheck: `shellcheck tools/pipeline-controller/bin/pipeline-controller`
- Stub runs without error: `bash tools/pipeline-controller/bin/pipeline-controller --help` exits 0

---

## Task 2: Implement state management helpers (lib/state.sh)

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1
- **Related ADRs:** ADR-0005
- **Related Core-Components:** None

### Description
Create `tools/pipeline-controller/lib/state.sh` with bash functions for managing `.pipeline-state.json`:
- `state_init <issue_number>` — creates initial state file with 4 stages, stage 1 = `ready`, rest = `locked`
- `state_read` — outputs current state JSON to stdout
- `state_get_stage <stage_id>` — outputs the status of a specific stage
- `state_set_stage <stage_id> <status>` — updates a stage's status with timestamp
- `state_file_path` — returns path to state file (`$(git rev-parse --show-toplevel)/.pipeline-state.json`)
- All functions use `jq` for JSON manipulation
- Advisory file locking via `flock` (or PID-file fallback if unavailable)

### Acceptance Criteria
- [ ] `lib/state.sh` is sourceable without side effects (`source lib/state.sh` produces no output)
- [ ] `state_init 42` creates `.pipeline-state.json` in current directory with correct structure
- [ ] `state_get_stage research` returns `ready` after init
- [ ] `state_get_stage plan` returns `locked` after init
- [ ] `state_set_stage research running` updates status and adds timestamp
- [ ] Sequential gating: setting stage N to `done` makes stage N+1 `ready`
- [ ] State file is valid JSON after every operation

### Test Coverage
- Unit test script: create temp dir, source `lib/state.sh`, run each function, assert output with `jq`
- Validate JSON after each mutation: `jq empty .pipeline-state.json`
- Test gating logic: set research=done → verify plan=ready
- Test invalid transitions are rejected (e.g., setting locked stage to done)
- Shellcheck: `shellcheck tools/pipeline-controller/lib/state.sh`

---

## Task 3: Implement bin/pipeline-controller entrypoint

- **Status:** Pending
- **Complexity:** Medium-High
- **Dependencies:** Task 2
- **Related ADRs:** ADR-0005
- **Related Core-Components:** None

### Description
Implement the full entrypoint script at `tools/pipeline-controller/bin/pipeline-controller`:
1. Parse arguments: `<issue_number>` (required positional), `--port` (optional, default 8080)
2. Validate prerequisites: `gh auth status`, `jq --version`, `python3 --version`
3. Validate issue exists: `gh issue view <issue_number> --json number`
4. Source `lib/state.sh`
5. Initialize state: `state_init <issue_number>`
6. Start HTTP server: `python3 -m http.server <port>` serving from `site/` directory (background)
7. Print URL to stdout: `http://localhost:<port>`
8. Trap EXIT to kill background server
9. Optionally open browser (if `xdg-open` or `open` available)
10. Wait for server process

### Acceptance Criteria
- [ ] Running `bin/pipeline-controller 42` starts an HTTP server on port 8080
- [ ] Running `bin/pipeline-controller 42 --port 9090` uses port 9090
- [ ] Script fails with clear error if `gh auth status` fails
- [ ] Script fails with clear error if issue number is invalid/missing
- [ ] `.pipeline-state.json` is created in repo root after launch
- [ ] Ctrl+C (SIGINT) kills the background HTTP server cleanly
- [ ] Script prints the URL to stdout
- [ ] Script is POSIX-compatible bash (no bashisms beyond bash 4.x)

### Test Coverage
- Shellcheck: `shellcheck tools/pipeline-controller/bin/pipeline-controller`
- Dry-run mode test (mock `gh` and `python3` via PATH override)
- Argument parsing: verify `--port` is respected
- Error cases: missing issue number, missing `jq`, failed auth
- Integration: launch, curl `http://localhost:8080/`, verify 200, kill

---

## Task 4: Create site/index.html — pipeline card layout

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 1
- **Related ADRs:** ADR-0005
- **Related Core-Components:** None

### Description
Create `tools/pipeline-controller/site/index.html`:
- Responsive HTML page with 4 pipeline stage cards (Research, Plan, Implement, Verify)
- Each card shows: stage name, status badge, description, action button area
- Cards arranged horizontally (desktop) or vertically (mobile)
- Links to `assets/styles.css` and `assets/app.js`
- Displays the issue number (read from state via JS)
- No external dependencies (no CDN links, no frameworks)

### Acceptance Criteria
- [ ] `index.html` is valid HTML5 (passes basic lint)
- [ ] Contains exactly 4 stage cards with IDs: `stage-research`, `stage-plan`, `stage-implement`, `stage-verify`
- [ ] Each card has a status indicator element with class `status-badge`
- [ ] Links to `assets/styles.css` and `assets/app.js` (relative paths)
- [ ] No external network requests (no CDN, no fonts, no analytics)
- [ ] Displays correctly when served via `python3 -m http.server`

### Test Coverage
- File exists and is non-empty
- Contains expected stage IDs (grep check)
- No external URLs in the file (grep for `http://` or `https://` should return 0 matches excluding localhost)
- Served page returns 200 on `curl http://localhost:8080/`

---

## Task 5: Create site/assets/styles.css — visual styling

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** Task 4
- **Related ADRs:** ADR-0005
- **Related Core-Components:** None

### Description
Create `tools/pipeline-controller/site/assets/styles.css`:
- Card layout: flexbox horizontal on desktop, vertical on mobile (breakpoint ~768px)
- Status colours: `locked` (grey), `ready` (blue), `running` (amber/animated), `done` (green), `failed` (red)
- Pipeline connector lines between cards (CSS borders or pseudo-elements)
- Clean, minimal aesthetic consistent with the SDD Evolution workshop site
- Dark mode support via `prefers-color-scheme` media query

### Acceptance Criteria
- [ ] File defines styles for all 5 states: `.status-locked`, `.status-ready`, `.status-running`, `.status-done`, `.status-failed`
- [ ] Cards display horizontally on screens ≥768px
- [ ] Cards stack vertically on screens <768px
- [ ] `.status-running` has a visual animation (pulse, spin, or similar)
- [ ] No external imports (`@import url(...)` with external URLs)

### Test Coverage
- File exists and is non-empty
- Contains all 5 status class definitions (grep check)
- Contains `@media` rule for responsive layout
- No external URL imports

---

## Task 6: Create site/assets/app.js — FSM client and polling

- **Status:** Pending
- **Complexity:** High
- **Dependencies:** Task 4, Task 5
- **Related ADRs:** ADR-0005
- **Related Core-Components:** None

### Description
Create `tools/pipeline-controller/site/assets/app.js`:
- Vanilla JavaScript, no dependencies, no build step
- On load: fetch `.pipeline-state.json` from server (relative path `/../.pipeline-state.json` or configured endpoint)
- Poll every 2 seconds for state changes
- Render card states: update CSS classes on stage cards based on state
- FSM transitions: clicking "Start" on a `ready` stage sets it to `running` (writes via fetch POST or signals entrypoint)
- Display issue number and current stage prominently
- Error handling: show connection error if fetch fails, retry with backoff

### Acceptance Criteria
- [ ] Fetches state file on page load
- [ ] Polls every 2 seconds (configurable interval)
- [ ] Updates card CSS classes to match state (`status-locked`, `status-ready`, etc.)
- [ ] Displays issue number from state file
- [ ] Shows error indicator if fetch fails (does not crash silently)
- [ ] No ES module imports from external URLs
- [ ] Works in modern browsers (Chrome, Firefox, Edge — no IE11)
- [ ] `'use strict';` at top of file

### Test Coverage
- File exists and is non-empty
- Contains `setInterval` or equivalent polling mechanism (grep)
- Contains `fetch` call (grep)
- Contains `'use strict'` (grep)
- Manual smoke test: serve site with mock state file, verify cards update
- No external URL references

---

## Task 7: Rebuild registry

- **Status:** Pending
- **Complexity:** Low
- **Dependencies:** Task 1
- **Related ADRs:** ADR-0003
- **Related Core-Components:** None

### Description
Run `scripts/rebuild-registry.sh` to regenerate `tools/registry.json` including the new
`pipeline-controller` tool. Verify the registry now contains 3 tools.

### Acceptance Criteria
- [ ] `tools/registry.json` contains an entry with `"slug": "pipeline-controller"`
- [ ] Registry `tools` array has 3 entries
- [ ] Registry passes JSON validation (`jq empty tools/registry.json`)
- [ ] `scripts/rebuild-registry.sh` exits 0

### Test Coverage
- Run `scripts/rebuild-registry.sh` and verify exit code
- Parse registry with `jq` and count tool entries
- Verify `pipeline-controller` entry has correct `path` and `manifest` fields

---

## Task 8: End-to-end validation

- **Status:** Pending
- **Complexity:** Medium
- **Dependencies:** Task 3, Task 6, Task 7
- **Related ADRs:** ADR-0003, ADR-0005
- **Related Core-Components:** CORE-COMPONENT-0002

### Description
Full end-to-end validation:
1. `check-jsonschema` passes on `tool.json`
2. `shellcheck` passes on all `.sh` and bash files
3. Entrypoint launches, creates state file, starts server
4. `curl http://localhost:8080/` returns 200 with HTML containing stage cards
5. State file is valid JSON with correct initial state
6. Server shuts down cleanly on SIGINT
7. No files written outside `tools/pipeline-controller/` except `.pipeline-state.json` in working directory

### Acceptance Criteria
- [ ] `check-jsonschema --schemafile schemas/tool.schema.json tools/pipeline-controller/tool.json` exits 0
- [ ] `shellcheck tools/pipeline-controller/bin/pipeline-controller tools/pipeline-controller/lib/state.sh` exits 0
- [ ] End-to-end: launch → curl → verify HTML → verify state → kill → verify clean exit
- [ ] No files created inside `tools/pipeline-controller/` at runtime
- [ ] `.pipeline-state.json` created in working directory (repo root)
- [ ] Registry is up-to-date (diff after rebuild is empty)

### Test Coverage
- Automated test script that runs the full sequence
- Schema validation command
- Shellcheck on all bash files
- HTTP response validation
- State file structure validation with `jq`
- Clean shutdown verification (no orphan processes)

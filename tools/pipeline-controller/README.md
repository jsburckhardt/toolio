# Pipeline Controller

Visual orchestration UI for the RPIV pipeline — launch, monitor, and control Research/Plan/Implement/Verify stages.

## Prerequisites

- `bash` (4.x+)
- `jq` (JSON processing)
- `python3` (HTTP server)
- `gh` (GitHub CLI, authenticated)
- A valid GitHub issue number

## Usage

```bash
# Launch with default port (8080)
tools/pipeline-controller/bin/pipeline-controller <issue_number>

# Launch with custom port
tools/pipeline-controller/bin/pipeline-controller <issue_number> --port 9090

# Show help
tools/pipeline-controller/bin/pipeline-controller --help
```

## How It Works

1. Validates prerequisites (gh auth, jq, python3)
2. Validates the GitHub issue exists
3. Creates `.pipeline-state.json` in the repository root
4. Starts an HTTP server serving the visual UI
5. Opens your browser to the pipeline dashboard

## Pipeline Stages

| Stage | Purpose |
|-------|---------|
| Research | Explore the problem space, classify scope, produce a research brief |
| Plan | Commit architectural decisions via ADRs, produce task breakdown and test plan |
| Implement | Execute tasks, write code and tests, verify against the plan |
| Verify | Run tests, commit, push, and open a pull request for review |

## State File

The controller writes `.pipeline-state.json` to the repository root (working directory).
This file is **not** committed to version control — add it to `.gitignore`.

## Architecture

- `bin/pipeline-controller` — POSIX bash entrypoint
- `lib/state.sh` — State management helpers (read/write `.pipeline-state.json`)
- `lib/server.py` — Custom Python HTTP server (serves UI + state API)
- `site/` — Static web UI assets (HTML, CSS, JS)

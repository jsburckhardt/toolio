# Pipeline Controller — Copilot Extension

A **Copilot Extension** using `@github/copilot-sdk` that provides a visual orchestration UI for the RPIV pipeline. It registers custom tools with the Copilot SDK session and serves a web-based pipeline dashboard.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  @github/copilot-sdk (CopilotClient + JSON-RPC)             │
│  ├── Custom Tools: get_pipeline_state, run_stage,           │
│  │                 complete_stage, get_stage_info            │
│  └── Session: model=gpt-4.1, streaming=true                 │
├─────────────────────────────────────────────────────────────┤
│  HTTP Server (localhost)                                     │
│  ├── GET  /api/state          → pipeline state JSON         │
│  ├── POST /api/stage/:id/start → start a stage              │
│  ├── POST /api/stage/:id/complete → complete a stage        │
│  ├── POST /api/stage/:id/retry → retry a failed stage       │
│  └── Static files from site/                                │
├─────────────────────────────────────────────────────────────┤
│  Web UI (site/)                                              │
│  ├── 4 stage cards with status indicators                   │
│  ├── Play/retry buttons + info panels                       │
│  └── 2-second polling for state updates                     │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 20+
- GitHub CLI (`gh`) authenticated
- GitHub Copilot CLI installed

## Usage

```bash
# Launch for a specific issue
npx tsx tools/pipeline-controller/src/index.ts <issue_number>

# With custom port
npx tsx tools/pipeline-controller/src/index.ts <issue_number> --port 9090

# Using npm script (from tool directory)
cd tools/pipeline-controller
npm start -- 6
```

## What Happens

1. Validates `gh` auth and issue existence
2. Creates `.pipeline-state.json` in repo root
3. Starts HTTP server with API + static UI
4. Creates a **Copilot SDK session** with 4 custom tools registered
5. Opens pipeline dashboard in browser

## Copilot SDK Integration

The extension registers these custom tools with the SDK session:

| Tool | Description |
|------|-------------|
| `get_pipeline_state` | Returns current state of all 4 stages |
| `run_stage` | Starts a stage (must be in 'ready' status) |
| `complete_stage` | Marks a running stage as done, unlocks next |
| `get_stage_info` | Returns purpose, inputs, outputs for a stage |

If the Copilot CLI is not available, the web UI still works independently via the HTTP API.

## Pipeline Stages

| Stage | Purpose |
|-------|---------|
| Research | Explore the problem space, classify scope, produce a research brief |
| Plan | Commit architectural decisions, produce task breakdown and test plan |
| Implement | Execute tasks, write code and tests |
| Verify | Run tests, commit, push, open PR |

## State Machine

```
locked → ready → running → done
                    ↓
                  failed → ready (retry)
```

When stage N completes (`done`), stage N+1 automatically transitions from `locked` to `ready`.


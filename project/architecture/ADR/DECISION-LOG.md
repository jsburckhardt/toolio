# Decision Log

This file is the single registry of all architectural decisions and core-components in the project. Every new or modified ADR or core-component **must** be recorded here.

## ADRs

| ID | Title | Status | Date |
|----|-------|--------|------|
| ADR-0002 | Repository Layout Standard | Accepted | 2025-06-20 |
| ADR-0003 | Tool and Workshop Packaging Convention | Accepted | 2025-06-20 |
| ADR-0004 | Extension-Driven Workshop Layout Standard | Accepted | 2026-05-19 |

## Core-Components

| ID | Title | Status | Date |
|----|-------|--------|------|
| CORE-COMPONENT-0002 | Commit Standards | Adopted | 2026-05-05 |

## Decisions

Short, actionable statements derived from ADRs and core-components. More than one decision can originate from a single source.

| # | Decision | Source | Date |
|---|----------|--------|------|
| 1 | Enforce Conventional Commits v1.0.0 on every commit message | CORE-COMPONENT-0002 | 2026-05-05 |
| 2 | Require Conventional Commits format on PR titles | CORE-COMPONENT-0002 | 2026-05-05 |
| 3 | Require Co-authored-by trailer on all AI-authored commits | CORE-COMPONENT-0002 | 2026-05-05 |
| 4 | Place all reusable tools under the top-level tools/ directory | ADR-0002 | 2025-06-20 |
| 5 | Place all training content under the top-level workshops/ directory | ADR-0002 | 2025-06-20 |
| 6 | Place JSON Schema validation files under the top-level schemas/ directory | ADR-0002 | 2025-06-20 |
| 7 | Place build and maintenance scripts under the top-level scripts/ directory | ADR-0002 | 2025-06-20 |
| 8 | Store registry.json inside tools/ as a derived file | ADR-0002 | 2025-06-20 |
| 9 | Exclude hidden directories from tool discovery scanning | ADR-0002 | 2025-06-20 |
| 10 | Require tool.json manifest in every tool directory with fields: name, displayName, version, description, author, license, type, tags, entrypoint | ADR-0003 | 2025-06-20 |
| 11 | Require workshop.json manifest in every workshop directory with fields: name, displayName, version, description, author, license, difficulty, estimatedDuration, prerequisites, objectives | ADR-0003 | 2025-06-20 |
| 12 | Restrict tool type to enum: agent-instruction, script, config, skill, extension | ADR-0003 | 2025-06-20 |
| 13 | Enforce slug naming pattern ^[a-z0-9][a-z0-9-]*$ for tool and workshop directories | ADR-0003 | 2025-06-20 |
| 14 | Use JSON Schema Draft 2020-12 for all schema definitions | ADR-0003 | 2025-06-20 |
| 15 | Use check-jsonschema (Python) for JSON Schema validation in CI and locally | ADR-0003 | 2025-06-20 |
| 16 | Generate registry.json via scripts/rebuild-registry.sh using bash and jq | ADR-0003 | 2025-06-20 |
| 17 | Prohibit hand-editing of tools/registry.json | ADR-0003 | 2025-06-20 |
| 18 | Permit two workshop layouts: `steps/` for read-along and `extension/`+`modules/` for interactive harness workshops | ADR-0004 | 2026-05-19 |
| 19 | Require every interactive workshop to ship an offline bash entrypoint at `extension/bin/workshop` | ADR-0004 | 2026-05-19 |
| 20 | Prohibit workshop extensions from writing outside `workshops/<slug>/` at install or runtime | ADR-0004 | 2026-05-19 |
| 21 | Prohibit adding a `layout` field to `workshop.json`; infer workshop layout from directory presence | ADR-0004 | 2026-05-19 |
| 22 | Require `workshops/README.md` to document both Layout A and Layout B side-by-side | ADR-0004 | 2026-05-19 |
| 23 | Defer ADR-0005 (Copilot CLI plugin install convention) until `copilot /plugin install` introduces a repo-root path | ADR-0004 | 2026-05-19 |
| 24 | Defer CORE-COMPONENT-0003 (Workshop Harness Pattern) until a second harness workshop is proposed | ADR-0004 | 2026-05-19 |

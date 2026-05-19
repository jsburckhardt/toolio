# Soft Factory Agents

A collection of AI agent instructions implementing the **Soft Factory RPIV pipeline** for automated software delivery.

## Overview

The Soft Factory pipeline moves work through four stages: **Research → Plan → Implement → Verify**. Each stage is handled by a dedicated agent with clear inputs, outputs, and guardrails.

## Agents

| Agent | Purpose | File |
|-------|---------|------|
| JustDoIt | Single-pass RPIV for small issues | [justdoit.agent.md](../../.github/agents/justdoit.agent.md) |
| Research | Exploration and scope classification | [research.agent.md](../../.github/agents/research.agent.md) |
| Planner | ADRs, action plans, task breakdown, test plans | [planner.agent.md](../../.github/agents/planner.agent.md) |
| Implementer | Code, tests, verification | [implementer.agent.md](../../.github/agents/implementer.agent.md) |
| Verifier | Test validation, commits, PR creation | [verifier.agent.md](../../.github/agents/verifier.agent.md) |
| Bootstrap | New project scaffolding | [bootstrap.agent.md](../../.github/agents/bootstrap.agent.md) |
| Onboard Repo | Introduce Soft Factory to existing repos | [onboard-repo.agent.md](../../.github/agents/onboard-repo.agent.md) |
| Issue Generator | Structured issue creation with acceptance criteria | [issue-generator.agent.md](../../.github/agents/issue-generator.agent.md) |
| APS v1.2.2 | APS prompt generator agent | [aps-v1.2.2.agent.md](../../.github/agents/aps-v1.2.2.agent.md) |
| Excalidraw | Excalidraw diagram agent | [excali.agent.md](../../.github/agents/excali.agent.md) |

## RPIV Pipeline Flow

```
┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│ Research  │ →  │   Plan   │ →  │ Implement   │ →  │  Verify  │
└──────────┘    └──────────┘    └─────────────┘    └──────────┘
     │                │                │                  │
  research.md    ADRs, plans     code + tests      commits + PR
```

1. **Research** — The research agent fetches the GitHub issue, classifies scope, and identifies architectural needs.
2. **Plan** — The planner creates ADRs, core-components, action plans, task breakdowns, and test plans.
3. **Implement** — The implementer executes tasks, writes code and tests following the plan.
4. **Verify** — The verifier runs tests, creates commits, and opens a PR.

## Usage

These agents are designed to be invoked through GitHub Copilot Chat or Claude Code. Reference them via the `@agent` syntax in your IDE or invoke them through the Soft Factory pipeline orchestration.

## Platform Compatibility

- **VS Code Copilot** — Full support via GitHub Copilot Chat agents
- **Claude Code** — Full support via agent instruction files

# toolio

Reusable Copilot agents, skills, and engineering workflow plugins.

## Plugins

| Plugin | Description |
| --- | --- |
| `soft-factory-agents` | Soft Factory engineering pipeline agents: RPIV (Research, Plan, Implement, Verify), plus bootstrap, onboarding, issue generation, and the Agnostic Prompt Standard generator. |
| `soft-factory-skills` | Soft Factory skills: RPIV (`rpiv`, `rpiv-research`, `rpiv-planner`, `rpiv-implementer`, `rpiv-verifier`) plus `bootstrap`, `onboard-repo`, `issue-generator`, `excali`, `harness-cli-it`, and the Agnostic Prompt Standard, with shared templates. |
| `soft-factory-extras` | Extra Soft Factory agents and skills, including the `deep-research` orchestrator that runs an Exa-powered, Microsoft-preferring research pipeline, and the `pr-review-complement` skill. |
| `visual-explainer` | Generate self-contained HTML pages for diagrams, diff/plan reviews, project recaps, comparison tables, and slide decks. |

## Layout

```
toolio/
├── README.md
├── .github/
│   └── plugin/
│       └── marketplace.json
└── plugins/
    ├── soft-factory-agents/
    │   ├── plugin.json
    │   └── agents/
    │       └── *.agent.md          # rpiv-research, rpiv-planner, rpiv-implementer, rpiv-verifier, rpiv, …
    ├── soft-factory-skills/
    │   ├── plugin.json
    │   └── skills/                 # rpiv*, bootstrap, onboard-repo, issue-generator, excali, agnostic-prompt-standard, templates/
    ├── soft-factory-extras/
    │   ├── plugin.json
    │   ├── agents/                 # deep-research
    │   └── skills/
    │       └── pr-review-complement/
    └── visual-explainer/
        ├── plugin.json
        ├── commands/               # /diff-review, /plan-review, /generate-slides, …
        └── skills/
            └── visual-explainer/
                ├── SKILL.md
                ├── references/     # css-patterns, libraries, responsive-nav, slide-patterns
                └── templates/      # architecture, data-table, mermaid-flowchart, slide-deck
```

## Install

Install the marketplace:

```bash
copilot plugin marketplace add jsburckhardt/toolio
```

Install a plugin:

```bash
copilot plugin install soft-factory-agents@toolio
copilot plugin install soft-factory-skills@toolio
copilot plugin install visual-explainer@toolio
```

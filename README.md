# toolio

Reusable Copilot agents, skills, and engineering workflow plugins.

## Plugins

| Plugin | Description |
| --- | --- |
| `soft-factory` | Full Soft Factory engineering pipeline: RPIV agents and skills, plus bootstrap, onboarding, issue generation, and the Agnostic Prompt Standard. |
| `soft-factory-extras` | Extra Soft Factory agents, including the `deep-research` orchestrator that runs an Exa-powered, Microsoft-preferring research pipeline. |
| `visual-explainer` | Generate self-contained HTML pages for diagrams, diff/plan reviews, project recaps, comparison tables, and slide decks. |

## Layout

```
toolio/
├── README.md
├── .github/
│   └── plugin/
│       └── marketplace.json
└── plugins/
    ├── soft-factory/
    │   ├── plugin.json
    │   ├── agents/
    │   │   └── *.agent.md          # research, planner, implementer, verifier, justdoit, …
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
copilot plugin install soft-factory@toolio
copilot plugin install visual-explainer@toolio
```

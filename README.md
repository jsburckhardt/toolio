# toolio

Reusable Copilot agents, skills, and engineering workflow plugins.

## Plugins

| Plugin | Description |
| --- | --- |
| `soft-factory-agents` | Soft Factory engineering pipeline agents: RPIV (Research, Plan, Implement, Verify), plus bootstrap, onboarding, issue generation, and the Agnostic Prompt Standard generator. |
| `soft-factory-skills` | Soft Factory skills: RPIV (`rpiv`, `rpiv-research`, `rpiv-planner`, `rpiv-implementer`, `rpiv-verifier`) plus `bootstrap`, `onboard-repo`, `issue-generator`, `excali`, `harness-cli-it`, and the Agnostic Prompt Standard, with shared templates. |
| `soft-factory-v2` | Opt-in skill-based delivery: alignment, deep-module design, vertical slices, approved spikes, TDD worktree workers and independent acceptance. V1 is unchanged. |
| `soft-factory-extras` | Extra Soft Factory agents and skills, including the `deep-research` orchestrator that runs an Exa-powered, Microsoft-preferring research pipeline, the `prd-to-gh-issues` agent that turns a PRD into a linked GitHub issue backlog, and the `pr-review-complement` skill. |
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
    │   ├── agents/                 # deep-research, issue-aligner, prd-to-gh-issues
    │   └── skills/
    │       └── pr-review-complement/
    ├── soft-factory-v2/
    │   ├── plugin.json
    │   ├── README.md
    │   └── skills/                 # factory-onboard, align, design, slice, spike, deliver, accept
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
copilot plugin install soft-factory-v2@toolio
copilot plugin install visual-explainer@toolio
```

V2's [plugin guide](plugins/soft-factory-v2/README.md) covers repository enablement,
deliberate upgrades and the shared-devcontainer/worktree model. It is an opt-in
implementation preview, not a completed real-product pilot. Full scaffolding and
standalone architecture scanning remain deferred.

## Contributing

Run `just verify` for plugin/skill contracts, Node syntax and v2's real-git lifecycle
integration tests. The controlled Copilot fixture tests scheduling/recovery mechanics;
it does not certify model behaviour or a live external API. Node.js 20+, git and just
are required; the checks add no npm dependencies.

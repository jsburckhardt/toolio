# toolio — Repository Instructions for AI Agents & Contributors

`toolio` is a **GitHub Copilot CLI plugin marketplace**. It packages reusable
Copilot **agents**, **skills**, and **commands** into installable plugins, plus a
vendored copy of the **Agnostic Prompt Standard (APS) v1.0** that defines how
agents in this repo are authored. Users add the marketplace with
`copilot plugin marketplace add jsburckhardt/toolio` and install individual
plugins with `copilot plugin install <plugin>@toolio`.

## Repository structure

```
toolio/
├── README.md                          # Marketplace overview, plugin table, install commands
├── AGENTS.md                          # This file — instructions for agents/contributors
├── llms.txt                           # llms.txt index of important files
├── .github/
│   ├── plugin/
│   │   └── marketplace.json           # SOURCE OF TRUTH for published plugins
│   ├── pull_request_template.md       # Contribution checklist
│   ├── agents/
│   │   └── aps-v1.2.2.agent.md         # Repo-level APS agent generator
│   └── skills/
│       └── agnostic-prompt-standard/  # APS v1.0 skill (spec + adapters + guides)
│           ├── SKILL.md               # Skill entrypoint
│           ├── references/            # 00..07 — the APS normative spec
│           ├── platforms/             # adaptor.md per platform (copilot-cli, vscode-copilot,
│           │                          #   claude-code, opencode, generic)
│           ├── guides/                # skill-authoring, subagent-architecture guides
│           ├── processes/             # build-skill.md workflow
│           ├── assets/                # example constants/format blocks
│           └── _template/             # skill scaffold
├── plugins/
│   ├── soft-factory/
│   │   ├── plugin.json
│   │   ├── agents/                    # RPIV + utility agents (*.agent.md)
│   │   └── skills/pr-review-complement/
│   ├── soft-factory-extras/
│   │   ├── plugin.json                # references .mcp.json via "mcpServers"
│   │   ├── agents/deep-research.agent.md
│   │   └── .mcp.json                  # Exa hosted MCP server
│   └── visual-explainer/
│       ├── plugin.json
│       ├── commands/                  # slash commands (*.md)
│       └── skills/visual-explainer/   # SKILL.md, references/, templates/
└── session-metrics/
    └── extension.mjs                  # In-memory Copilot CLI session-metrics extension
```

### Important files

- `.github/plugin/marketplace.json` — the marketplace manifest; the authoritative
  list of published plugins (name, description, version, source path).
- `README.md` — human-facing overview and plugin table; must stay in sync with the manifest.
- `.github/skills/agnostic-prompt-standard/SKILL.md` — APS v1.0 skill entrypoint.
- Each `plugins/<name>/plugin.json` — that plugin's manifest.

## Plugins

| Plugin | Version | Description |
| --- | --- | --- |
| `soft-factory` | 0.1.0 | RPIV (Research, Plan, Implement, Verify) agents and skills, plus bootstrap, onboarding, issue generation, and the Agnostic Prompt Standard. Agents live in `agents/`; skill `pr-review-complement` in `skills/`. |
| `soft-factory-extras` | 0.1.0 | Extra Soft Factory agents, including the `deep-research` orchestrator that runs an Exa-powered, Microsoft-preferring research pipeline. Bundles its own `.mcp.json` (Exa hosted MCP). |
| `visual-explainer` | 0.8.1 | Generate self-contained HTML pages for diagrams, diff/plan reviews, project recaps, comparison tables, and slide decks. Ships slash `commands/` and a `visual-explainer` skill. |

`soft-factory/agents/` contains: `research`, `planner`, `implementer`, `verifier`,
`justdoit`, `bootstrap`, `onboard-repo`, `issue-generator`, `harness-cli-it`,
`excali`, and `aps-v1.2.2`.

## Conventions & rules

### Plugin manifest (`plugin.json`)

- Required keys: `name` (kebab-case), `description`, `version`, `author` (object with `name`).
- Content arrays (each holds directory or file paths, relative to the plugin dir):
  `agents`, `skills`, `commands`, `rules`.
- Optional keys: `hooks`, `lspServers`, `repository`, `license`, and `mcpServers`.
  - `mcpServers` is either a **string path** to a bundled `.mcp.json`
    (e.g. `soft-factory-extras` uses `"./.mcp.json"`) OR an inline record of servers.
- Must be **valid JSON**.

### Marketplace + README sync

- Adding, renaming, or removing a plugin REQUIRES updating BOTH
  `.github/plugin/marketplace.json` AND the README plugin table.
- Each marketplace entry has `name`, `description`, `version`, and `source` (the plugin dir path).

### APS agent authoring

- Agents are `*.agent.md` (VSCode-format frontmatter) or `*.agent.yaml` (native format).
- Agents MUST follow APS v1.0 section order:
  `instructions → constants → formats → runtime → triggers → processes → input`.
- Use MUST / SHOULD / MAY vocabulary; one directive per line; no blank lines inside `<instructions>`.
- Respect the tag-newline rule; no tabs; no `//` comments in prompt sections.
- Frontmatter field order: Required (`name`, `description`) → Recommended → Conditional.

### Tool-name grammar

- Copilot CLI / native tools are **bare snake_case**:
  `view`, `create`, `edit`, `bash`, `grep`, `glob`, `web_fetch`, `web_search`,
  `task`, `ask_user`, `report_intent`, etc.
- MCP tools use `<server>/<tool>` slash notation, e.g. `exa/web_search_exa`.
- NEVER use `read` or `write` as tool names — they are permission categories.
  Use `view` (read), `create` (new file), or `edit` (modify) instead.
- VSCode-format agents may instead use qualified names (e.g. `search/codebase`,
  `execute/runInTerminal`), as `soft-factory/agents/research.agent.md` does.

### MCP servers

- Repo-root `.mcp.json` and `.github/mcp.json` are auto-loaded by the Copilot CLI
  (neither currently exists at repo root).
- Plugins bundle their own `.mcp.json`, referenced from `plugin.json`'s `mcpServers`.
- The Exa hosted MCP (`https://mcp.exa.ai/mcp`, `type: http`) needs no API key for normal search.

## How to add or change a plugin

1. Create `plugins/<name>/` and a valid `plugin.json` (`name`, `description`, `version`, `author`).
2. Add content directories and wire them into `plugin.json`:
   `agents/` → `"agents"`, `skills/<name>/` → `"skills"`, `commands/` → `"commands"`.
3. If the plugin needs MCP tools, add a `.mcp.json` in the plugin dir and set
   `"mcpServers": "./.mcp.json"` in `plugin.json`.
4. Author agents to APS v1.0 (section order, MUST/SHOULD/MAY, tool grammar above).
5. Add or update the entry in `.github/plugin/marketplace.json`
   (`name`, `description`, `version`, `source`).
6. Update the plugin table in `README.md` to match.
7. Validate all JSON (see below).
8. Test locally: `copilot --plugin-dir plugins/<name>` or
   `copilot plugin install <name>@toolio`.

## Validation / checks

- `plugin.json` and every `.mcp.json` must be valid JSON
  (e.g. `python -c 'import json,sys; json.load(open(sys.argv[1]))' <file>`).
- Agents pass APS lint: correct section order, tag-newline rule, no tabs,
  no `//` comments, bare snake_case tool names (`<server>/<tool>` for MCP),
  no `read`/`write` tool names.
- `marketplace.json` and README plugin table are in sync.
- No secrets, tokens, or personal data committed.
- Follow the checklist in `.github/pull_request_template.md` before opening a PR.

# Step 1: Introduction

## What is a "Tool" in Toolio?

A **tool** in Toolio is any reusable piece of content that helps developers work with AI agents, configure environments, or automate workflows. Tools are packaged in a standard way so they can be discovered, validated, and shared.

## Tool Types

Toolio supports five types of tools:

| Type | Description | Examples |
|------|-------------|----------|
| `agent-instruction` | AI agent prompts and instruction files | Agent definitions, system prompts |
| `script` | Executable scripts | Bash scripts, Python utilities |
| `config` | Configuration files and templates | DevContainer configs, editor settings |
| `skill` | APS-compliant skills | Skills with SKILL.md entrypoint |
| `extension` | IDE or platform extensions | VS Code extensions, plugins |

## Tool Structure

Every tool lives in its own subdirectory under `tools/` and must contain:

```
tools/my-tool/
├── tool.json    # Manifest (required)
└── README.md    # Documentation (required)
```

The `tool.json` manifest describes the tool's metadata, and the `README.md` provides human-readable documentation.

## Next Step

In the next step, you'll create your own tool folder and manifest.

→ [Step 2: Create Tool Folder](./02-create-tool-folder.md)

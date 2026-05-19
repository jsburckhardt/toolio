# Step 2: Create Tool Folder

## Create the Directory

Choose a slug name for your tool. Slugs must:
- Use only lowercase letters, numbers, and hyphens
- Start with a letter or number
- Match the pattern: `^[a-z0-9][a-z0-9-]*$`

```bash
mkdir -p tools/my-example-tool
```

## Create the Manifest

Create `tools/my-example-tool/tool.json` with the following structure:

```json
{
  "$schema": "../../schemas/tool.schema.json",
  "name": "my-example-tool",
  "displayName": "My Example Tool",
  "version": "1.0.0",
  "description": "A brief description of what this tool does",
  "author": "your-github-username",
  "license": "MIT",
  "type": "script",
  "tags": ["example", "tutorial"],
  "entrypoint": "main.sh"
}
```

## Required Fields

| Field | Description |
|-------|-------------|
| `name` | Must match your folder name (the slug) |
| `displayName` | Human-readable name shown in catalogues |
| `version` | Semantic version (e.g., `1.0.0`) |
| `description` | One-line summary of what the tool does |
| `author` | Your name or GitHub handle |
| `license` | SPDX license identifier (e.g., `MIT`, `Apache-2.0`) |
| `type` | One of: `agent-instruction`, `script`, `config`, `skill`, `extension` |
| `tags` | Array of discovery keywords (at least one) |
| `entrypoint` | Relative path to the main file |

## Validate Your Manifest

```bash
check-jsonschema --schemafile schemas/tool.schema.json tools/my-example-tool/tool.json
```

If validation passes, you'll see no errors. If it fails, the error message will tell you which field is invalid.

## Next Step

→ [Step 3: Write README](./03-write-readme.md)

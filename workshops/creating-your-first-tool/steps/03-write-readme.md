# Step 3: Write a Tool README

## Why a README?

Every tool needs a `README.md` that explains what it does, how to use it, and any relevant details. The README is the primary documentation humans will read.

## Create the README

Create `tools/my-example-tool/README.md`:

```markdown
# My Example Tool

A brief description matching your tool.json description.

## Overview

Explain what the tool does and why someone would use it.

## Usage

Show how to use the tool with examples:

\`\`\`bash
# Example command or usage
./main.sh --option value
\`\`\`

## Configuration

Document any configuration options if applicable.

## Platform Compatibility

List which platforms this tool works with.
```

## Best Practices

- Keep the description concise but informative
- Include at least one usage example
- Link to any referenced files using relative paths
- Don't duplicate content from other files — link to them instead

## Next Step

→ [Step 4: Rebuild Registry](./04-rebuild-registry.md)

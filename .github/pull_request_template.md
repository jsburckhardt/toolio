<!-- Thanks for contributing to toolio! Please fill out the sections below. -->

## Summary

<!-- What does this PR change and why? -->

## Type of change

- [ ] New plugin
- [ ] New agent / skill / command
- [ ] Update to an existing plugin, agent, skill, or command
- [ ] Docs only
- [ ] Chore / tooling

## Affected plugin(s)

<!-- e.g. soft-factory, soft-factory-extras, visual-explainer -->

## Details

<!-- Notable design decisions, new dependencies, MCP servers, or breaking changes. -->

## Checklist

- [ ] `plugin.json` and any `.mcp.json` / config files are valid JSON
- [ ] New/changed agents follow the Agnostic Prompt Standard (section order, tag rules, tool grammar)
- [ ] Tool names use bare snake_case (and `<server>/<tool>` for MCP); no `read`/`write` as tool names
- [ ] `README.md` and `.github/plugin/marketplace.json` updated if a plugin was added or renamed
- [ ] Changes tested locally (e.g. `copilot --plugin-dir <plugin>` or `copilot plugin install ...`)
- [ ] No secrets, tokens, or personal data committed

## Related issues

<!-- e.g. Closes #123 -->

# Step 5: Submit a Pull Request

## Create a Feature Branch

```bash
git checkout -b feat/1-my-example-tool
```

## Stage Your Changes

```bash
git add tools/my-example-tool/ tools/registry.json
```

## Commit

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```bash
git commit -m "feat: add my-example-tool to Toolio catalogue"
```

## Push and Open PR

```bash
git push origin feat/1-my-example-tool
```

Then open a pull request on GitHub. Make sure to:

1. Reference the issue number in the PR body: `Closes #<ISSUE_NUMBER>`
2. Verify CI passes (schema validation + registry consistency check)
3. Request review

## What CI Checks

The `validate.yml` workflow will:

1. **Validate schemas** — Ensures your `tool.json` conforms to the schema
2. **Check registry consistency** — Rebuilds the registry and verifies it matches what you committed

If either check fails, review the error messages and fix your manifest.

## Congratulations! 🎉

You've successfully:
- Created a tool with a valid manifest
- Written documentation
- Regenerated the registry
- Submitted a PR following the RPIV pipeline

Welcome to the Toolio community!

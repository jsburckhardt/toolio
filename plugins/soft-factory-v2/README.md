# Soft Factory v2

An opt-in Copilot CLI plugin. V1 plugins are unchanged. This version provides the
delivery skills and tested lifecycle helpers; it is not a claim that the Pocket
collector pilot or a real autonomous parallel delivery has completed.

## Entry points

| Skill | Use |
|---|---|
| `factory-onboard` | Discover an existing repository and establish real `just` checks. |
| `factory-align` | Grill through a change until commitments and acceptance are clear. |
| `factory-design` | Design deep modules and meaningful test surfaces. |
| `factory-slice` | Define small vertical outcomes and actual dependencies. |
| `factory-spike` | Request and execute an explicitly approved bounded investigation. |
| `factory-deliver` | Resume, implement with TDD, review, integrate and publish a PR. |
| `factory-accept` | Independently review an exact task or final implementation SHA. |

Invoke skills by their qualified names, for example
`/soft-factory-v2:factory-align`, with the issue or change description. Keep project
policy and architecture in the project, not in a personal chat. A question is not
permission to implement. After an agreed go, delivery is autonomous through PR
creation; merge and release need separately delegated authority.

## Installation and upgrades

After the plugin is available on the marketplace's default branch:

```sh
copilot plugin marketplace add jsburckhardt/toolio
copilot plugin install soft-factory-v2@toolio
```

For repository enablement, merge (do not overwrite) these entries into the consuming
repository's `.github/copilot/settings.json`:

```json
{
  "enabledPlugins": { "soft-factory-v2@toolio": true },
  "extraKnownMarketplaces": {
    "toolio": { "source": { "source": "github", "repo": "jsburckhardt/toolio" } }
  }
}
```

Repository trust is required. Upgrade deliberately; do not opt toolio into automatic
updates. Record the installed plugin version and helper digest in work evidence.
This is not a general marketplace version lock. An existing user auto-update policy
can still update the installed plugin. Exact reproducibility needs a separately
verified mechanism; never claim pinning from a version string alone.

For local validation without installing:

```sh
copilot --plugin-dir /absolute/path/to/toolio/plugins/soft-factory-v2 skill list
```

## Environment and execution

Work inside the existing devcontainer. Node.js 20+, git, Copilot CLI and real project
`just` recipes must be available. Separate workers share that environment; worktrees
under `.trees/` do not provide security isolation. Ports/databases/output directories
must be task-specific where necessary. `--yolo` grants all CLI permissions.

Use the helper through the absolute path resolved from the loaded delivery skill:

```sh
node /absolute/plugin/path/skills/factory-deliver/scripts/worktrees.mjs status
```

The helper is a small foreground lifecycle tool, not a daemon or scheduler. A lead
starts bounded `run`/`review` commands using the CLI's background-command facility
and continues independent work. The commands stay alive until their worker exits.
See the delivery reference for commands, task plans, recovery and acceptance.

The single-lead token and path checks are coordination safeguards, not a security
boundary against a worker with all permissions. Reports assert evidence; scripts
validate their structure, exact commits and actual git state, not their truthfulness.
Independent reviewers must inspect and reproduce evidence.

## Boundaries

One delivery issue produces one final PR. Worker branches are internal tasks. Default
to sequential work; two independent implementers are supported, not required on every
issue. Review before serial integration, then accept the combined SHA. Do not bypass
failed checks, treat process exit as acceptance or silently enlarge scope.

Spikes write structured findings under `docs/spikes/` after explicit approval.
Integration tests take priority over test counts; unit tests remain useful where they
add distinct confidence. Full scaffolding and a standalone architecture scan are
deferred. The Pocket collector and aimigo are separate later product work.

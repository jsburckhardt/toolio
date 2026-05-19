# scaffold-with-copilot-sdk

> Meta-document describing how this workshop is scaffolded with
> `@github/copilot-sdk`, with the SDK and Node.js versions pinned at
> implementation time.

## Versions (pinned at implementation time)

@github/copilot-sdk@1.0.0-beta.4
Node.js v24.15.0

- @github/copilot-sdk@1.0.0-beta.4 (published; no public command-registration API observed at the time of writing)
- Node.js v24.15.0 (devcontainer default LTS)
- bats 1.10.0 (test harness)
- jq, check-jsonschema, flock (util-linux) — present in the devcontainer

## Disposition of the SDK adapter

The Copilot CLI installed in the devcontainer (`/usr/local/bin/copilot`) does
**not** expose a `copilot /plugin install` subcommand at the CLI surface. The
`/plugin` and `/experimental` slash-commands are interactive REPL commands only.
Therefore, per the binding decision tree in the action plan:

- The **bash entrypoint** at `extension/bin/workshop` IS the canonical
  implementation.
- The TypeScript SDK adapter under `extension/commands/*.ts` is a documented
  future-work stub. Each command compiles, declares the same argv contract as
  bash, and delegates to `extension/bin/workshop` via `child_process.spawnSync`.
- When the SDK publishes a stable command-registration API, the adapter can be
  fleshed out without touching the bash layer.

## Why bash is canonical

ADR-0004 §Cross-layout rule #3 mandates a POSIX-bash offline entrypoint for
every Layout-B workshop. Making bash canonical guarantees:

1. The workshop runs offline (no SDK, no Node.js network access).
2. Every behaviour is identical online and offline — the SDK does not introduce
   a forked code path.
3. The harness is auditable as a single ~600-LOC bash program.

## How the SDK is used (when it ships)

When the SDK exposes a `registerCommand` interface, each TS file in
`extension/commands/` will register its command and either delegate to bash
(the default) or layer SDK-only behaviour on top:

| Command            | Bash | SDK-only behaviour                                            |
|--------------------|------|---------------------------------------------------------------|
| `start`            | yes  | none                                                          |
| `install-hooks`    | yes  | none                                                          |
| `next`             | yes  | none                                                          |
| `status`           | yes  | none                                                          |
| `verify`           | yes  | none                                                          |
| `coach`            | yes  | model-generated critique categories (degraded banner in bash) |
| `diagnose 2x2`     | yes  | none                                                          |
| `reset`            | yes  | none                                                          |
| `scaffold`         | yes  | agent-augmented draft body (bash emits skeleton only)         |
| `accept-draft`     | yes  | none                                                          |
| `reject-draft`     | yes  | none                                                          |
| `onboard`          | yes  | agent-augmented ADR/CC draft body (bash emits skeleton)       |
| `install-promote-ephemeral` | yes | none                                                |
| `fan-out`          | yes  | none                                                          |

## Side-by-side install refusal

The workshop refuses to install a second copy when a previous installation
marker exists at `.workshop-install-marker`. Use `workshop start --upgrade` to
replace the prior install. `workshop reset` removes the marker.

## How to invoke

```bash
# Offline (canonical):
workshops/sdd-evolution-harness-engineering/extension/bin/workshop help

# Online (SDK adapter — currently delegates to bash):
node workshops/sdd-evolution-harness-engineering/extension/commands/index.ts help
```

## References

- ADR-0004 — Extension-Driven Workshop Layout Standard
- Research brief: `project/issues/4/research/00-research.md`
- Task breakdown T12: `project/issues/4/plan/02-task-breakdown.md`

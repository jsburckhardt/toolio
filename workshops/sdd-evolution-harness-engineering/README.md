# SDD-Evolution Harness Engineering Workshop

> **Difficulty:** advanced · **Duration:** 3h15m (90-minute condensed agenda available) · **License:** MIT · **Author:** [@jsburckhardt](https://github.com/jsburckhardt)

An interactive, harness-driven workshop that teaches **Spec-Driven Development
evolution**: build computational guides and sensors, drive the four-stage
**RPIV** pipeline (Research, Plan, Implement, Verify), detect drift across the
six git triggers, scaffold ADRs and core-components as **draft candidates**
that never auto-mutate canonical files, and safely onboard a brownfield repo.

This workshop is packaged as a **Copilot CLI extension** with an offline POSIX
bash entrypoint that IS the canonical implementation. The SDK adapter layers on
top; nothing breaks without the SDK.

## SDK availability callout

At implementation time, the public `copilot` CLI (`/usr/local/bin/copilot`)
**did not expose** a `copilot /plugin install` subcommand. The `/plugin` and
`/experimental` slash-commands are interactive REPL features only. Therefore:

- **Run the workshop via the bash entrypoint** below — it is canonical.
- The TypeScript SDK adapter under `extension/commands/` is a documented
  future-work stub that compiles and delegates to bash. See
  [`scaffold-with-copilot-sdk.md`](./scaffold-with-copilot-sdk.md) for details.

## Quickstart

```bash
# 1. From any git repository's root (your own, or a clone of toolio):
WORKSHOP=workshops/sdd-evolution-harness-engineering/extension/bin/workshop

# 2. Start:
$WORKSHOP start
$WORKSHOP install-hooks
$WORKSHOP status

# 3. Walk modules:
$WORKSHOP run 00-baseline
$WORKSHOP next

# 4. Tear down at any time (idempotent):
$WORKSHOP reset
```

Force offline mode (skip SDK probes) with `WORKSHOP_FORCE_OFFLINE=1`.
Honour `NO_COLOR=1` and `TERM=dumb` to suppress ANSI escapes.

## Modules

| # | Title                              | File                                                    |
|---|------------------------------------|---------------------------------------------------------|
| 0 | Baseline                           | [modules/00-baseline.md](./modules/00-baseline.md)     |
| 1 | RPIV from Scratch                  | [modules/01-rpiv-from-scratch.md](./modules/01-rpiv-from-scratch.md) |
| 2 | Sensors First                      | [modules/02-sensors-first.md](./modules/02-sensors-first.md) |
| 3 | Research Stage                     | [modules/03-research-stage.md](./modules/03-research-stage.md) |
| 4 | Plan Stage                         | [modules/04-plan-stage.md](./modules/04-plan-stage.md) |
| 5 | Implement & Promote (stretch)      | [modules/05-implement-and-promote.md](./modules/05-implement-and-promote.md) |
| 6 | Quadrant Fillers (stretch)         | [modules/06-quadrant-fillers.md](./modules/06-quadrant-fillers.md) |
| 7 | Fan-Out (stretch)                  | [modules/07-fan-out.md](./modules/07-fan-out.md) |
| 8 | Closing Kata                       | [modules/08-closing-kata.md](./modules/08-closing-kata.md) |

Modules 5, 6, and 7 are **independently runnable** — completing Module 4 is
not a prerequisite for Module 6.

## 90-minute condensed agenda

The full workshop runs about 3h15m. For 90-minute time-boxes (e.g. a meetup
slot), use the agenda below. Stretch modules 5–7 are **explicitly skipped**.

| T+    | Slot                       | Commands                                           |
|-------|----------------------------|----------------------------------------------------|
| T+0   | Setup                      | `workshop start`, `workshop install-hooks`         |
| T+5   | Module 0 — baseline        | `workshop run 00-baseline`, `workshop status`      |
| T+15  | Module 1 — RPIV intro      | `workshop run 01-rpiv-from-scratch`, `workshop next` |
| T+25  | Module 2 — sensors-first   | `workshop diagnose 2x2`, `workshop diagnose 2x2 --json` |
| T+40  | Module 3 — research stage  | `workshop scaffold research`, `workshop coach post-research-coach`, `workshop accept-draft <id>` |
| T+60  | Module 4 — plan stage      | `workshop scaffold plan`, `workshop scaffold adr`, `workshop accept-draft <id>` |
| T+75  | Module 8 — closing kata    | `workshop coach kata`, `workshop debrief`          |
| T+85  | Reset                      | `workshop reset` (idempotent)                      |
| T+90  | End                        | —                                                  |

**Explicitly skipped in the 90-minute condensed agenda:** Module 5 (`install-promote-ephemeral`), Module 6 (quadrant fillers), Module 7 (`fan-out`).

## Command surface (canonical inventory)

`start`, `install-hooks`, `next`, `status`, `verify`, `coach`, `diagnose`,
`reset`, `run`, `debrief`, `scaffold`, `override`, `reconcile`, `onboard`,
`install-promote-ephemeral`, `fan-out`, `accept-draft`, `reject-draft`, `help`.

Flags: `--json` (on `help`/`status`/`verify`/`diagnose`), `--yes`, `--dry-run`,
`--upgrade`, `--help`.

## Draft-acceptance flow

`workshop scaffold *` and `workshop onboard` **never** mutate canonical files
directly. They write drafts under `.workshop-drafts/` and append an entry to
`pendingScaffoldDrafts` in the state file. The only path to canonical
mutation is `workshop accept-draft <id>`. `workshop reject-draft <id>` discards.

## Tests

```bash
bash workshops/sdd-evolution-harness-engineering/test-fixtures/run-tests.sh
```

See [`test-fixtures/MANUAL-VERIFICATION.md`](./test-fixtures/MANUAL-VERIFICATION.md)
for the three manual procedures (facilitator dry-run, unprimed-trainee run,
LLM-meta description).

## Attribution

Workshop authored by [@jsburckhardt](https://github.com/jsburckhardt) for the
[toolio](https://github.com/jsburckhardt/toolio) project under the MIT license.

## See also

- [`scaffold-with-copilot-sdk.md`](./scaffold-with-copilot-sdk.md) — pinned SDK
  and Node.js versions; how the adapter would be fleshed out.
- [`ADR-0004`](../../project/architecture/ADR/ADR-0004-extension-driven-workshop-layout.md) — the layout standard.

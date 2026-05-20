# Workshops Catalogue

This directory contains hands-on workshops for learning how to use and contribute to Toolio.
Every workshop is rooted at `workshops/<slug>/` with a `workshop.json` manifest validated by
[`schemas/workshop.schema.json`](../schemas/workshop.schema.json) and a `README.md`.

## Two layouts (ADR-0004)

Per [ADR-0004 — Extension-Driven Workshop Layout Standard](../project/architecture/ADR/ADR-0004-extension-driven-workshop-layout.md),
workshops use one of two equally-canonical layouts. The layout is inferred from disk; **no**
`layout` field is added to `workshop.json`.

### Layout A — `steps/` (passive / read-along)

```
workshops/<slug>/
├── workshop.json
├── README.md
└── steps/
    ├── 01-<name>.md
    └── …
```

Use when the workshop is delivered as static Markdown the trainee reads in order. No runtime
behaviour, no installation step beyond `git clone`. Reference: `creating-your-first-tool/`.

### Layout B — `extension/` + `modules/` (interactive / harness)

```
workshops/<slug>/
├── workshop.json
├── README.md
├── scaffold-with-copilot-sdk.md
├── extension/
│   ├── manifest.json
│   ├── bin/workshop      # POSIX bash offline entrypoint (canonical)
│   ├── commands/         # SDK adapter (delegates to bash)
│   ├── hooks/            # installable git-hook templates
│   └── lib/              # shared shell helpers
├── modules/              # action sheets ≤ ~80 lines each
└── test-fixtures/        # required when commands accept paths
```

Use when the workshop installs and runs code, mutates git state, or *teaches via doing*.
Any workshop scaffolded with `@github/copilot-sdk` MUST use Layout B. Reference:
`sdd-evolution-harness-engineering/`.

The layouts are **mutually exclusive** within a single workshop directory. Layout B's
`extension/` directory MUST NOT write outside `workshops/<slug>/` (besides the explicitly
documented hook installation under the trainee's `.git/hooks/` and the runtime
`.workshop-state.json` at the trainee's repo root). See ADR-0004 §Cross-layout rules.

## How to Add a Workshop

See [CONTRIBUTING.md](../CONTRIBUTING.md) for instructions on creating and submitting a new
workshop. Pick the layout that matches your workshop's runtime character.

## Catalogue by Difficulty

### Beginner

| Workshop | Description | Duration |
|----------|-------------|----------|
| [creating-your-first-tool](./creating-your-first-tool/) | Hands-on workshop for creating, packaging, and contributing a new tool | 30m |

### Intermediate

| Workshop | Description | Duration |
|----------|-------------|----------|
| *(none yet)* | | |

### Advanced

| Workshop | Description | Duration |
|----------|-------------|----------|
| [sdd-evolution-harness-engineering](./sdd-evolution-harness-engineering/) | Static-website pair workshop walking the SDD-evolution arc: hashtag prompts → RPIV → shared architecture → brownfield onboarding → harness 2×2 → parallel agents. Open `site/index.html`. | 3h15m (90 min condensed) |

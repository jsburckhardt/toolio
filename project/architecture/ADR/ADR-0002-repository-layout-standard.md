# ADR-0002: Repository Layout Standard

## Status

Accepted

## Context

The `toolio` repository exists as a scaffolded shell with Soft Factory pipeline infrastructure but no directories for tools, workshops, schemas, or scripts. Contributors (human and AI) cannot know where to place new content. A consistent top-level directory structure must be established before any tools or workshops can be contributed. Once established, all future contributions must conform to this layout — changing it later would require migrating all existing content.

Key questions resolved:
- Whether `registry.json` lives inside `tools/` or at the repo root
- Whether `schemas/` is a top-level directory or nested inside another
- Whether `scripts/` is used alongside `just` recipes
- Whether hidden directories (`.github/`) are treated as first-class tool content or excluded from discovery

## Decision

Adopt the following top-level directory structure:

```
toolio/
├── tools/                    # All reusable tools (one subdirectory per tool)
│   ├── registry.json         # Machine-readable index (derived, never hand-edited)
│   └── README.md             # Catalogue organized by tool type
├── workshops/                # Training/workshop content (one subdirectory per workshop)
│   └── README.md             # Catalogue organized by difficulty
├── schemas/                  # JSON Schema validation files
│   ├── tool.schema.json      # Schema for tool.json manifests
│   ├── workshop.schema.json  # Schema for workshop.json manifests
│   └── __tests__/            # Schema test fixtures
├── scripts/                  # Build and maintenance scripts
│   └── rebuild-registry.sh   # Regenerates tools/registry.json
├── .github/
│   └── workflows/
│       └── validate.yml      # CI validation workflow
└── (existing files unchanged)
```

Specific layout rules:

1. **`tools/`** — Each tool is a subdirectory named with a slug conforming to `^[a-z0-9][a-z0-9-]*$`. Each tool subdirectory must contain a `tool.json` manifest and a `README.md`.
2. **`workshops/`** — Each workshop is a subdirectory named with a slug conforming to the same pattern. Each must contain a `workshop.json` manifest, a `README.md`, and a `steps/` subdirectory with numbered step files.
3. **`schemas/`** — Top-level directory containing JSON Schema Draft 2020-12 files for manifest validation. Test fixtures live in `schemas/__tests__/`.
4. **`scripts/`** — Top-level directory for bash scripts. `just` recipes may wrap these scripts but scripts must be independently runnable.
5. **`tools/registry.json`** — Lives inside `tools/` (not repo root) because it indexes both tools and workshops and its primary consumer is tooling that already operates within the tools context.
6. **Hidden directories excluded** — `.github/`, `.devcontainer/`, `.git/` are never scanned by the discovery mechanism. Seed tools may reference content in hidden directories via relative paths in their manifests.

## Alternatives

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Flat structure (all tools at root level) | Simple for small repos | Does not scale; pollutes root with many directories | Becomes unmanageable past 10 tools |
| Monorepo with packages/ dir | Familiar to JS/Go developers | Implies package manager tooling; over-engineered for content repo | Toolio is content-first, not code-first |
| registry.json at repo root | Visible at top level | Mixes derived files with source files; confusing for contributors | Derived files belong near what they index |
| Nested schemas inside tools/ | Fewer top-level dirs | Schemas validate workshops too; nesting is misleading | Schemas are cross-cutting |

## Consequences

### Positive
- Clear, predictable locations for all content types
- AI agents can navigate via `LLM.txt` entries for these directories
- New contributors can onboard by reading directory READMEs
- CI can validate structure with simple path-based checks

### Negative
- Adding a new content type (e.g., `templates/`) requires updating this ADR
- Four new top-level directories increase initial cognitive load

### Neutral
- Existing `.github/agents/` and `.github/skills/` content remains in place; seed tools reference it without moving it

## Related Issues

- [#1](https://github.com/jsburckhardt/toolio/issues/1)

## References

- Research brief: `project/issues/1/research/00-research.md`

# ADR-0004: Extension-Driven Workshop Layout Standard

## Status

Accepted

## Context

ADR-0002 (Repository Layout Standard, §Specific layout rules #2) currently requires every
workshop to contain "a `workshop.json` manifest, a `README.md`, and a `steps/` subdirectory
with numbered step files." That convention fits passive, read-as-you-go Markdown workshops
like `workshops/creating-your-first-tool/` but cannot express the runtime artifacts that an
*interactive, harness-driven* workshop needs: an extension package, executable hooks, library
code, action-sheet modules, an offline bash entrypoint, scaffolders, and a state machine.

GitHub Issue #4 introduces `sdd-evolution-harness-engineering`, a workshop built as a Copilot
CLI extension scaffolded with `@github/copilot-sdk`. It needs a different on-disk shape:

- `extension/` — installable Copilot CLI extension package (`manifest.json`, `commands/`,
  `hooks/`, `lib/`, `bin/workshop` offline fallback)
- `modules/` — action sheets `00-baseline.md` … `08-closing-kata.md` (≤ ~80 lines each)
- `scaffold-with-copilot-sdk.md` — meta-doc describing how the SDK scaffolded the workshop
- `test-fixtures/` — fixture repos (brownfield, hook-chain fixtures) for harness tests

That shape contradicts ADR-0002 rule #2 verbatim. We need an ADR that explicitly permits the
new layout, says when each layout is appropriate, and avoids inventing a third layout later.

This decision is global because every future workshop author will pick one of the two layouts
and must do so without having to re-litigate ADR-0002.

## Decision

We accept **two equally-canonical workshop layouts**, both rooted at
`workshops/<slug>/` with `workshop.json` (conforming to `schemas/workshop.schema.json`) and
`README.md`. The trailing structure differs by the workshop's runtime character.

### Layout A — `steps/` (passive / read-along workshops)

```
workshops/<slug>/
├── workshop.json
├── README.md
└── steps/
    ├── 01-<name>.md
    ├── 02-<name>.md
    └── …
```

When to use: the workshop is delivered as static Markdown the trainee reads in order. No
runtime behaviour, no installation step beyond `git clone`. The seed workshop
`workshops/creating-your-first-tool/` is the reference.

### Layout B — `extension/` + `modules/` (interactive / harness workshops)

```
workshops/<slug>/
├── workshop.json
├── README.md
├── scaffold-with-copilot-sdk.md           # required for SDK-scaffolded workshops
├── extension/
│   ├── manifest.json                      # Copilot CLI / SDK extension manifest
│   ├── bin/
│   │   └── workshop                       # bash fallback entrypoint (POSIX shell, executable)
│   ├── commands/                          # SDK-registered subcommands (one file per command)
│   ├── hooks/                             # installable git hook templates
│   └── lib/                               # shared shell/TS helpers
├── modules/
│   ├── 00-<name>.md                       # action-first sheet (≤ ~80 lines)
│   ├── 01-<name>.md
│   └── …
└── test-fixtures/                         # optional; required when harness commands accept paths
    └── <fixture-name>/
```

When to use: the workshop installs and runs code, mutates git state, exposes a command surface,
or otherwise *teaches via doing*. Any workshop scaffolded with `@github/copilot-sdk` MUST use
Layout B.

### Cross-layout rules

1. The two layouts are mutually exclusive within a single workshop directory. A workshop
   either uses `steps/` OR `extension/` + `modules/`; never both.
2. `workshop.json` is required in both layouts and validated against
   `schemas/workshop.schema.json` (ADR-0003). **No new top-level `workshop.json` field is
   introduced** by this ADR; the layout is inferred from directory presence, not declared in
   the manifest. (Adding a `layout` field would amend the schema and is explicitly out of
   scope for this ADR.)
3. Layout B's `extension/bin/workshop` is the **canonical offline entrypoint** and MUST be a
   POSIX-compatible bash script runnable without Node.js or the SDK. SDK-based commands
   layer on top of it through a thin adapter; they do not replace it.
4. Layout B's `extension/` directory is **self-contained**: it MUST NOT write files outside
   `workshops/<slug>/` at install time, MUST NOT register repo-root paths, and MUST NOT mutate
   `tools/registry.json`, `LLM.txt`, `DECISION-LOG.md`, or any other canonical file at install
   or runtime. The registry continues to be regenerated only by `scripts/rebuild-registry.sh`
   (ADR-0003 Decision #16).
5. Layout B's hooks are installed into the trainee's `.git/hooks/` only via an explicit
   `workshop install-hooks` command, chain after any pre-existing hook, back the prior hook
   up to `.git/hooks/<name>.workshop-backup.<unix-ts>`, and self-identify on the first line.
6. `workshops/README.md` MUST document both layouts side-by-side so contributors choosing a
   layout can do so without reading this ADR.
7. `workshops/<slug>/test-fixtures/` is the only sanctioned location for harness test
   fixtures. Fixtures MUST NOT contain secrets, MUST NOT execute arbitrary code on harness
   invocation, and MUST be small enough that harness security limits (file count, depth)
   exercise their boundary cases without timing out tests.

### Disposition of conditional/optional artifacts from the research brief

- **ADR-0005 (Copilot CLI Plugin/Extension Install Convention) — DEFERRED.** The
  `copilot /plugin install` mechanism could not be confirmed in this planning environment.
  The research brief's recommended default position is adopted: the bash entrypoint
  `extension/bin/workshop` is canonical, the SDK extension layers on top, and installation —
  if available — targets only `workshops/<slug>/extension/`, introducing no new repo-root
  convention. If a repo-root convention later proves necessary, a new ADR will be opened.
- **CORE-COMPONENT-0003 (Workshop Harness Pattern) — DEFERRED.** Only one harness workshop is
  in scope. The pattern is documented inside `sdd-evolution-harness-engineering/` and will be
  promoted to a core-component the first time a second harness workshop is proposed.

## Alternatives

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Amend ADR-0002 in place to permit `extension/` | One source of truth | ADR-0002 is a *layout* ADR for the whole repo; conflating workshop sub-structure into it obscures history | Keep ADRs single-purpose; ADR-0004 supplements ADR-0002 rule #2 |
| Add a `layout: "extension"` field to `workshop.json` | Explicit, discoverable | Requires amending `schemas/workshop.schema.json` (which has `additionalProperties: false`) and an additional ADR; layout is already unambiguous from directory presence | Avoid coupling layout to schema; infer from disk |
| Force every new workshop to use Layout B | One convention | Punishes simple read-along workshops with extension scaffolding overhead | Over-engineered for static content |
| Allow arbitrary sub-structure per workshop | Maximum flexibility | No convention means no tooling can discover modules or steps reliably | Defeats the point of ADR-0002 |
| Treat the extension as a `tools/` entry | Reuses tool packaging | The extension is workshop-bound pedagogy, not a reusable tool; would require a `tool.json` and pollute `tools/registry.json` | Wrong primary consumer |

## Consequences

### Positive
- Harness-style workshops are a first-class layout, not a one-off exception.
- ADR-0002 rule #2 is preserved unchanged; ADR-0004 supplements it without rewriting history.
- Future SDK-scaffolded workshops have a stable shape to target.
- The offline bash entrypoint is mandated, eliminating "SDK-only" workshops that break in
  degraded environments.

### Negative
- Two layouts means contributors must pick one; `workshops/README.md` must explain the
  trade-off clearly to avoid analysis paralysis.
- Discovery tooling (`scripts/rebuild-registry.sh`, future linters) must handle both shapes.
- Reviewers must enforce that Layout B workshops do not silently write outside their own
  directory — a new failure mode.

### Neutral
- `schemas/workshop.schema.json` is unchanged; the schema team is not blocked.
- `tools/registry.json` continues to track workshops by manifest path regardless of layout.

## Related Issues

- [#4](https://github.com/jsburckhardt/toolio/issues/4)

## References

- ADR-0002 — Repository Layout Standard (`project/architecture/ADR/ADR-0002-repository-layout-standard.md`)
- ADR-0003 — Tool and Workshop Packaging Convention (`project/architecture/ADR/ADR-0003-tool-and-workshop-packaging-convention.md`)
- `schemas/workshop.schema.json`
- `workshops/creating-your-first-tool/` — Layout A reference
- Research brief `project/issues/4/research/00-research.md` §Proposed ADRs and §Existing Context

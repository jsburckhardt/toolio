# ADR-0005: Extension-Type Tool Internal Layout Standard

## Status

Accepted

## Context

ADR-0003 defines the `tool.json` manifest schema and the type taxonomy, which includes
`extension` as a valid tool type. ADR-0004 defines internal layout conventions for
*workshops* (Layout A and Layout B) but explicitly states it does not govern tools.
ADR-0004 Decision #23 deferred ADR-0005 until `copilot /plugin install` introduced a
repo-root path; however, the bash-first approach pursued in issue #6 does not depend on
that mechanism, so the deferral condition no longer applies.

The two existing tools (`devcontainer-toolio`, `soft-factory-agents`) are both non-executable:
they contain only `tool.json` and `README.md` with entrypoints pointing outside their own
directory. An `extension`-type tool is fundamentally different — it ships executable code,
may include a web UI, and needs conventions for where executable scripts, shared libraries,
and static assets live.

Without a convention, each extension tool author would invent their own structure, making
discovery tooling, security auditing, and contributor onboarding inconsistent.

## Decision

### Internal directory layout for `type: "extension"` tools

All extension-type tools reside at `tools/<slug>/` per ADR-0002. The internal structure is:

```
tools/<slug>/
├── tool.json              # Required (ADR-0003)
├── README.md              # Required: launch instructions, prerequisites, usage
├── bin/
│   └── <slug>             # Required: POSIX bash entrypoint, chmod +x
├── lib/                   # Optional: shared shell/script helpers
│   └── *.sh
└── site/                  # Optional: static web UI assets
    ├── index.html
    └── assets/
        ├── styles.css
        └── app.js
```

### Rules

1. **Entrypoint**: The `entrypoint` field in `tool.json` MUST be `bin/<slug>`. The file at
   that path MUST be a POSIX-compatible bash script (shebang `#!/usr/bin/env bash`) and MUST
   be executable (`chmod +x`). It MUST be runnable without Node.js, Python, or any SDK.

2. **bin/ directory**: Required for extension tools. Contains only the canonical entrypoint
   script. The filename MUST match the tool slug.

3. **lib/ directory**: Optional. Contains shared shell helpers sourced by the entrypoint.
   Files MUST use `.sh` extension. No nested subdirectories beyond one level.

4. **site/ directory**: Optional. Contains static web UI assets (HTML, CSS, JS). The naming
   `site/` aligns with the precedent set by
   `workshops/sdd-evolution-harness-engineering/site/`. When present, the entrypoint is
   responsible for serving these files (e.g., via `python3 -m http.server`).

5. **Install-time write boundary**: Extension tools MUST NOT write outside `tools/<slug>/` at
   install time. They MUST NOT mutate `tools/registry.json`, `LLM.txt`,
   `DECISION-LOG.md`, or any other canonical file.

6. **Runtime write boundary**: At runtime, state files (e.g., `.pipeline-state.json`) are
   written to the invoking working directory (typically `$(git rev-parse --show-toplevel)`),
   NOT inside `tools/<slug>/`. This keeps the tool directory immutable during execution.

7. **SDK integration**: Optional. If `copilot run extension <slug>` becomes available, the
   SDK adapter layers on top of the bash entrypoint — it does not replace it. The bash
   entrypoint remains the canonical, always-functional launch method.

8. **Static web UI serving**: When `site/` is present and the entrypoint launches an HTTP
   server, it MUST use `python3 -m http.server` (available in the devcontainer) bound to
   `localhost` on a user-configurable or default port (e.g., 8080). The entrypoint MUST
   print the URL to stdout.

### tool.json example

```json
{
  "$schema": "../../schemas/tool.schema.json",
  "name": "pipeline-controller",
  "displayName": "Visual Pipeline Controller",
  "version": "1.0.0",
  "description": "Visual RPIV pipeline controller with sequential stage gating",
  "author": "jsburckhardt",
  "license": "MIT",
  "type": "extension",
  "tags": ["pipeline", "rpiv", "workflow", "visual"],
  "platforms": ["generic"],
  "entrypoint": "bin/pipeline-controller"
}
```

## Alternatives

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Reuse ADR-0004 Layout B for tools | Familiar structure | ADR-0004 is workshop-specific; tools have no `modules/`, `commands/`, or `hooks/` | Wrong domain; would pollute workshop conventions |
| Allow arbitrary internal structure | Maximum flexibility | No tooling can discover entrypoints or assets reliably; inconsistent security auditing | Defeats purpose of packaging convention |
| Require Node.js entrypoint (SDK-first) | Richer programmatic API | Adds hard dependency on Node.js and experimental SDK; breaks in degraded environments | Bash-first proven durable in issue #4 pivot |
| Place state files inside `tools/<slug>/` | Self-contained | Pollutes version-controlled tool directory with runtime state; git status noise | Violates immutability of tool directory at runtime |
| Use `public/` instead of `site/` for web assets | Common in frameworks | Inconsistent with existing `site/` precedent in the repo | Prefer internal consistency over external convention |

## Consequences

### Positive
- Extension tools have a predictable, auditable internal structure
- The bash entrypoint guarantees functionality without SDK or Node.js
- `site/` naming is consistent with existing workshop precedent
- Runtime state separation keeps tool directories clean in version control
- Security auditing is simplified: only `bin/<slug>` needs execute permission review

### Negative
- Contributors must follow a specific directory structure for extension tools (slightly more overhead)
- Two write boundaries (install-time vs runtime) require understanding by tool authors
- `python3 -m http.server` is a development-only server; not suitable for production (acceptable for devcontainer-scoped tools)

### Neutral
- No changes to `schemas/tool.schema.json` are required — the `entrypoint` field already accepts relative paths
- `scripts/rebuild-registry.sh` continues to work unchanged — it only reads `tool.json`
- ADR-0004's principles transfer cleanly; this ADR is its tool-domain counterpart

## Related Issues

- [#6](https://github.com/jsburckhardt/toolio/issues/6)

## References

- ADR-0003 — Tool and Workshop Packaging Convention
- ADR-0004 — Extension-Driven Workshop Layout Standard (precedent for bash-first, write-boundary rules)
- `workshops/sdd-evolution-harness-engineering/site/` — `site/` naming precedent
- Research brief: `project/issues/6/research/00-research.md`

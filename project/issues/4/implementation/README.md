# Implementation Notes — Issue #4

## Final deliverable

A self-contained static website under `workshops/sdd-evolution-harness-engineering/site/`.
Zero build step, zero runtime dependencies. Nine module pages walk the SDD-evolution arc
with concept narrative, numbered exercises, expected-output callouts, debrief questions,
and takeaway summaries.

### Files shipped (final)

```
workshops/sdd-evolution-harness-engineering/
├── workshop.json          (manifest; consumed by tools/registry.json)
├── README.md              (how to open the site; three methods)
└── site/
    ├── index.html         (landing + arc diagram + module grid)
    ├── assets/
    │   ├── styles.css     (dark theme, accessible, responsive)
    │   └── app.js         (copy buttons, sidebar active-link highlight)
    └── modules/
        ├── 00-baseline.html
        ├── 01-plan-implement.html
        ├── 02-rpiv.html
        ├── 03-shared-architecture.html
        ├── 04-brownfield-onboarding.html
        ├── 05-wrap-dont-fork.html
        ├── 06-harness-engineering.html
        ├── 07-parallel-agents.html
        └── 08-closing-kata.html
```

### How to run

```bash
# Option A — open directly
open workshops/sdd-evolution-harness-engineering/site/index.html

# Option B — serve locally (recommended in Codespaces / VS Code)
python3 -m http.server 8000 \
  --directory workshops/sdd-evolution-harness-engineering/site
# then open http://127.0.0.1:8000/

# Option C — host anywhere static
# Drop site/ on GitHub Pages, Netlify, S3, nginx — anywhere that serves files.
```

### Verification (current)

| Check | Command | Result |
|-------|---------|--------|
| Workshop schema | `check-jsonschema --schemafile schemas/workshop.schema.json workshops/*/workshop.json` | ✅ ok -- validation done |
| Tool schema | `check-jsonschema --schemafile schemas/tool.schema.json tools/*/tool.json` | ✅ ok -- validation done |
| Registry derivation | `bash scripts/rebuild-registry.sh && diff <(jq 'del(.generatedAt)' tools/registry.json) <(git show HEAD:tools/registry.json | jq 'del(.generatedAt)')` | ✅ empty diff |
| HTTP smoke (`/`, `/modules/06-harness-engineering.html`, `/assets/styles.css`) | `curl -o /dev/null -w '%{http_code}'` after `python3 -m http.server` | ✅ 200 / 200 / 200 |
| CI workflow | `.github/workflows/validate.yml` on the PR branch | ✅ success |

### Commits that produced the final deliverable

| SHA | Title |
|-----|-------|
| `313585d` | feat(workshop): add interactive workshop website |
| `5a5d6f0` | refactor(workshop): replace bash CLI harness with static website |
| `227f488` | docs(catalogue): point Advanced row at the website-based workshop |
| `a07303a` | chore(registry): regenerate tools/registry.json after workshop refactor |

---

## Historical record — the CLI implementation (superseded)

> The content below describes the original CLI implementation in commits
> `9fd27ce`..`fecde61` of this PR. It is preserved for traceability: future
> readers can see what was tried, what was learned, and why we pivoted. **None
> of these files exist in the working tree anymore.**

### T00 verification (live, devcontainer)

```
=== copilot --help ===
Usage: copilot [options] [command]
GitHub Copilot CLI - An AI-powered coding assistant.
… (no `plugin` subcommand visible at the CLI surface; /plugin and /experimental
   are interactive REPL slash-commands only)

=== which ===
/usr/local/bin/copilot
/usr/local/share/nvm/versions/node/v24.15.0/bin/node
/usr/bin/jq
/usr/bin/flock
/home/vscode/.local/bin/check-jsonschema

=== node --version ===
v24.15.0

=== npm view @github/copilot-sdk version ===
1.0.0-beta.4
```

**Decision-tree outcome (at the time):** `copilot /plugin install` does not exist
as a CLI subcommand. Per the action plan's binding decision tree, the bash
entrypoint at `extension/bin/workshop` was adopted as the canonical
implementation, and the SDK adapter under `extension/commands/` was a documented
future-work stub. ADR-0005 was not opened.

### Files created (now deleted)

- `workshops/sdd-evolution-harness-engineering/workshop.json` (rewritten, not deleted)
- `workshops/sdd-evolution-harness-engineering/README.md` (rewritten, not deleted)
- `workshops/sdd-evolution-harness-engineering/extension/bin/workshop` (~280 LOC)
- `workshops/sdd-evolution-harness-engineering/extension/lib/{state,lock,drift,hooks,scaffold,onboard,diagnose,coach}.sh`
- `workshops/sdd-evolution-harness-engineering/extension/hooks/{pre-commit-research-gate,pre-commit-plan-gate,pre-pr-verify-gate}`
- `workshops/sdd-evolution-harness-engineering/extension/commands/{index,coach,scaffold}.ts` (SDK adapter stubs)
- `workshops/sdd-evolution-harness-engineering/extension/manifest.json`
- `workshops/sdd-evolution-harness-engineering/modules/00-baseline.md` … `08-closing-kata.md` (9 sparse action sheets)
- `workshops/sdd-evolution-harness-engineering/scaffold-with-copilot-sdk.md`
- `workshops/sdd-evolution-harness-engineering/test-fixtures/brownfield/{README.md,Dockerfile,package.json,.gitignore,src/app.py,tests/test_app.py,docs/architecture.md,.github/workflows/ci.yml}`
- `workshops/sdd-evolution-harness-engineering/test-fixtures/{run-tests.sh,MANUAL-VERIFICATION.md}`
- `LLM.txt` (one line for the workshop — retained, points at the same path)

### Test results (at the time)

Command: `bash workshops/sdd-evolution-harness-engineering/test-fixtures/run-tests.sh`

**Summary: PASS=68  FAIL=0**

68 automated tests passed across schema validation, layout, dispatch,
state-machine drift detection (all six triggers), hook chaining (Husky,
pre-commit.com, raw), sensor pass/fail, draft acceptance, coach degraded-mode,
2×2 inspector, brownfield onboarding security (symlink escape, traversal,
size/depth limits, secret redaction), promote-ephemeral, fan-out, SDK-extension
hygiene, and offline-mode integration.

### Why the pivot happened

The CLI passed every test the plan asked for. The user opened it, ran
`workshop start`, `install-hooks`, `status`, `run 00-baseline` — and asked
*"where is the workshop or what i can see"*. The honest answer was: nowhere
visible. The CLI was a tool. The "modules" were 15-line bullet lists. There
was no narrative, no teaching content, no UI.

The website was built from the verbatim source narrative (Appendix A of the
issue body) into nine proper lesson pages and shipped in commits
`313585d`..`a07303a` (see the table above).

### Lessons for the next pipeline run

1. **&ldquo;Action-first&rdquo; ≠ &ldquo;no teaching content&rdquo;.** A workshop module file with only bullet-list
   commands and three debrief questions is not a workshop; it is a runbook. The
   plan stage and the verifier should explicitly check for narrative content
   (e.g., minimum word count per module, or presence of concept-explanation
   sections), not just structural conformance.
2. **Have a human eyeball the artifact before declaring done.** All 68 tests
   passed and the artifact was still useless. Computational sensors caught
   nothing because nothing they tested was wrong; the *thing being tested* was
   wrong.
3. **&ldquo;Interactive&rdquo; in the issue title was the trap.** The implementer read
   &ldquo;interactive&rdquo; as &ldquo;CLI commands the trainee runs&rdquo;. The user meant
   &ldquo;something a person can navigate and see and follow&rdquo;. Future issue
   generators should disambiguate &mdash; e.g., explicitly list deliverable
   format (website? CLI? notebook? slides?) as an acceptance criterion.
4. **Static sites are an underused workshop delivery mechanism.** ADR-0004
   permits only `steps/` and `extension/+modules/` layouts. A future ADR
   should formalise `site/` as a third permitted layout.

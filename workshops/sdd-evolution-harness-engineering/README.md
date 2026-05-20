# SDD Evolution — From `# write a function` to Harness Engineering

A hands-on, lego-style pair workshop on how agentic coding actually evolves
under load — from hashtag prompts to a full RPIV harness with guides and
sensors.

- **Difficulty:** advanced
- **Duration:** ~3 hours full · 90 min condensed
- **Format:** pairs (driver + navigator, swap every module)
- **Author:** [@jsburckhardt](https://github.com/jsburckhardt)
- **License:** MIT

## How to open the workshop

The workshop is a **self-contained static website** under [`site/`](./site/).
Zero build step, zero dependencies — just open it.

### Option 1 — Open `site/index.html` directly

Double-click `site/index.html` in your file manager, or:

```bash
# macOS
open workshops/sdd-evolution-harness-engineering/site/index.html

# Linux
xdg-open workshops/sdd-evolution-harness-engineering/site/index.html

# Windows
start workshops\sdd-evolution-harness-engineering\site\index.html
```

### Option 2 — Serve it locally (recommended for VS Code / Codespaces)

```bash
python3 -m http.server 8000 --directory workshops/sdd-evolution-harness-engineering/site
# then open http://127.0.0.1:8000/
```

In VS Code or Codespaces, accept the port-forward toast or use
**Simple Browser → http://127.0.0.1:8000/**.

### Option 3 — Host it anywhere

The site is plain HTML / CSS / JS. Drop `site/` on GitHub Pages, Netlify,
S3, nginx — anywhere that serves static files.

## What's in the workshop

Nine modules walk the one-year arc of agentic coding:

| # | Module | Time | Track |
|---|--------|------|-------|
| 0 | Baseline | 10 min | Core |
| 1 | Plan / Implement | 20 min | Core |
| 2 | RPIV crystallises | 35 min | Core |
| 3 | Shared architecture | 20 min | Core |
| 4 | Brownfield onboarding | 25 min | Core |
| 5 | Wrap, don't fork | 25 min | Stretch |
| 6 | Harness engineering | 30 min | Stretch |
| 7 | Parallel agents | 20 min | Stretch |
| 8 | Closing kata | 10 min | Wrap-up |

Each module page contains: concept narrative, numbered exercises with
copy-paste commands, "what you should see" expectations, debrief questions
for pair discussion, and a takeaway callout.

## 90-minute condensed agenda

Modules 0 → 2 → 8 with light pacing. Skip stretch modules entirely.

## Layout

```
workshops/sdd-evolution-harness-engineering/
├── README.md          (this file — how to open the workshop)
├── workshop.json      (manifest; consumed by tools/registry.json)
└── site/              (the workshop itself — open site/index.html)
    ├── index.html
    ├── assets/
    │   ├── styles.css
    │   └── app.js
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

## Further reading

- [Birgitta Böckeler — *Harness engineering for coding agent users*](https://martinfowler.com/articles/harness-engineering.html) (martinfowler.com, April 2026)
- [`jsburckhardt/soft-factory`](https://github.com/jsburckhardt/soft-factory) — the base repo the workshop builds on

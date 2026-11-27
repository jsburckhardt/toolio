<format id="DOCS_TREE_V1" name="Docs Tree" purpose="Where every kind of documentation lives in a v3 repository.">
- README.md is short: what it is, quickstart, links into `docs/`. Details belong in `docs/`.
- Create a page only when there is content for it; empty sections are not required.
- Dated files use `YYYYMMDD-<slug>.md`; same-day collisions differ by slug.
- Briefs stay in `docs/work/` after delivery with status `done`.

```text
README.md                        what it is, quickstart, links
llms.txt                         map for models: summary and key doc links
docs/
  index.md                       map of the docs
  getting-started.md             install and first run
  usage/                         configuration, CLI/API reference
  operations/                    deployment, scheduling, logging, troubleshooting
  development/                   environment, testing, ci-cd, contributing
    harness-backlog.md           factory-harvest proposals
  architecture/
    overview.md                  context and component map
    decisions.md                 index of ADRs and components; read first
    components/<COMPONENT>.md    one per deep module
    adr/<DATE>-<SLUG>.md         decisions that constrain future work
  spikes/<DATE>-<SLUG>.md        approved bounded experiments
  work/<DATE>-<SLUG>.md          delivery briefs
```
WHERE:
- <COMPONENT> is String; kebab-case module name.
- <DATE> is String; `YYYYMMDD`.
- <SLUG> is String; kebab-case.
</format>

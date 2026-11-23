<format id="AGENTS_DELIVERY_SECTION_V1" name="AGENTS.md Delivery Section" purpose="Route every session and worker in a consuming repo to the soft-factory-v2 flow.">
- Insert into the repository root `AGENTS.md`; create the file only if missing.
- Replace only the text between the two markers; preserve everything else.
- Route to skills; do not restate their procedures.
- Omit `## Commands` lines that are not verified; never write placeholders.

```markdown
<!-- soft-factory-v2:begin -->
## How we deliver
Skills: <SKILLS_SOURCE>. Use them in this order:
1. `factory-align`: grill before building; one issue-linked work brief; wait for the owner's "go".
2. `factory-spike`: only when approved; bounded; written to `docs/spikes/`.
3. `factory-slice`: vertical tasks in the brief.
4. `factory-deliver`: one lead session; at most two implementers in `.trees/` via its `scripts/worker.sh`; serial integration; one PR per issue.
5. `factory-accept`: independent review per task and for the final SHA.
`factory-design` applies throughout: deep modules, small interfaces, integration tests first.

## Rules
- Questions are not authorisation to change things.
- The owner merges and releases unless delegated.
- Never commit secrets; read credentials from the environment.
- When a task introduces or changes build/test/lint commands, update `## Commands` in the same task.

## Commands
<COMMANDS>
<!-- soft-factory-v2:end -->
```
WHERE:
- <COMMANDS> is Markdown; verified commands as `- <purpose>: \`<command>\``, or `None yet.` for an empty repository.
- <SKILLS_SOURCE> is String; `.github/skills/` when vendored, otherwise `the soft-factory-v2 plugin`.
</format>

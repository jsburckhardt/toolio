# V2 delivery lifecycle

Status: implementation preview. Related decision:
[skill-based delivery](../adrs/ADR-20261121-skill-based-delivery.md).

## Ownership and interface

Owns `plugins/soft-factory-v2/`, its marketplace entry and documentation. The module
is the delivery lifecycle, not one component per source file. Public interfaces are
the seven `factory-*` skills, the delivery reference's task/report schema and helper
commands. The lead owns scope/design/publication; workers implement; separate reviewers
accept. Root validation recipes exercise this plugin alongside marketplace contracts.

## Invariants

- One lead token owns a delivery; ledger mutation is serialised locally.
- At most two implementers; active writes cannot overlap; prerequisites integrate first.
- Worker exit alone does not accept a task; scope, clean committed state and evidence
  must agree. Review must cover the unchanged actual SHA.
- Serial merges run combined checks; failed/busy integration gates dispatch.
- Conflict fixes require committed clean state and independent repair review.
- Final acceptance requires all tasks integrated and the exact current clean head.
- Interrupted/live work is not redispatched or deleted implicitly. Cleanup removes
  only known, integrated clean worktrees; reports/history remain.

Role rules and reported evidence are not mechanically enforced trust boundaries.
Worker resource separation, credential scope, subjective sign-off, finite corrections
and cross-channel communication remain lead/project responsibilities.

## Verification and operations

Run `just verify`. Integration fixtures create temporary real git repositories and
controlled CLI processes; they prove lifecycle mechanics, not model quality or live
Pocket API semantics. Local plugin discovery and an independent change review are
additional checks. The real collector pilot must exercise actual delivery before
calling the complete v2 workflow production-proven.

Node.js 20+, git, Copilot and actual project just recipes are prerequisites. The helper
uses `.trees/` locally; runtime logs/reports must not contain secrets or private data.
No npm/runtime application dependencies or MCP servers are added by this component.

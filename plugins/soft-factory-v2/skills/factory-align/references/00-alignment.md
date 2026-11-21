# Align before delivery

## Research and grilling

You MUST read the actual issue, relevant code/tests, project policy and architecture.
Facts are your job: inspect/probe or cite authoritative documentation instead of
asking the user for facts you can retrieve. Unsupported claims MUST be labelled
unverified. You MUST NOT transmit private code, transcripts or credentials to external
research services.

You MUST challenge weak proposals rather than automatically endorse them. Map open
decisions by prerequisites. Ask the currently answerable questions in rounds through
`ask_user`, with numbered questions and recommended answers. A "yes" SHOULD accept
the recommendation. You MUST wait for dependent answers before asking downstream
questions. You MUST involve the actual domain/decision owner when needed.

You MUST NOT treat brainstorming or a question as permission to edit, install,
create issues/repos or start workers. You MUST obtain a shared-understanding confirmation
and an explicit go for the delivery scope. After go, routine work is autonomous.
You MUST request an approved spike when material uncertainty needs bounded experimental
work; ordinary research is not a spike. Use `soft-factory-v2:factory-spike`.

## Work brief

You MUST use one canonical issue-linked work brief, by default
`docs/work/<issue>-<slug>/work.md`, or the repository's established equivalent.
Additional research/design/review files MAY help substantial work; they MUST NOT
duplicate the same authoritative facts. Preserve historical RPIV records.

The brief MUST contain:

- Problem, scope/exclusions, issue/branch and important constraints.
- Stable `AC-1`, `AC-2`, etc.: finite observable outcomes and decisive checks.
- Agreed behaviour, failure/default policies, public contracts and ownership.
- Owner decisions and load-bearing rejected alternatives with rationale/source.
- Delegated routine decisions versus material changes requiring renewed alignment.
- Local/deployed differences, external prerequisites and subjective owner sign-offs.
- Planned slices/checks and, later, committed evidence and independent verdicts.

You MUST apply `soft-factory-v2:factory-design` for meaningful design decisions.
You MUST document consequential durable choices in ADRs and meaningful module contracts
in maintained architecture docs, not one ADR per helper or one component per file.
Completed work records MUST be marked historical, not mistaken for current design.

## Alignment exit

You MAY proceed to slicing when scope, finite ACs, material behaviour, constraints,
next outcome and authority are agreed. You MUST NOT optimise a PRD indefinitely or
ask an arbitrary number of questions. Consequential out-of-spec behaviour, dependencies,
cost/privacy or contract changes MUST return to alignment; recording them is not approval.
Routine internal details MAY proceed within commitments. Use
`soft-factory-v2:factory-slice` next after agreement.

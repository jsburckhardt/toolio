# Design for leverage and locality

## Vocabulary

A module has an interface and implementation; its size can range from a function
to a tier-spanning feature. An interface is everything a caller needs to know:
behaviour, signatures, invariants, ordering, errors, configuration and relevant
performance. Depth means useful behaviour behind a small understandable interface,
not code length or a large class. A seam is where behaviour can vary without editing
callers. An adapter supplies that behaviour. Leverage helps callers do more with fewer
commitments; locality concentrates change, understanding and verification.

This vocabulary is informed by John Ousterhout's deep modules, Michael Feathers'
seams and Matt Pocock's workshop/design skills. Use it alongside existing project
domain language; do not rename every component or impose a new glossary.

## Design decisions

You MUST prefer established framework/vendor patterns and the smallest coherent change.
You MUST ask whether callers coordinate internal steps that should be hidden together.
You SHOULD concentrate related behaviour behind a useful interface so fixes and tests
do not spread across callers. Small internal functions remain appropriate.

You SHOULD examine what happens if an abstraction disappears: complexity that disappears
suggests pass-through indirection; complexity that spills into callers suggests useful
leverage. You MUST NOT add seams/configuration/plugins for imagined future variation.
Actual test or integration needs MAY justify a seam; show the need rather than apply
a mechanical "two adapters" rule.

Before implementation, you MUST settle meaningful behaviour, ownership, contract
semantics, persistence/compatibility, material failure cases and acceptance evidence.
For consequential choices, compare materially different options. You MAY use separate
design contexts when useful, but MUST NOT spawn agents just to compare trivial options.

The owner approves meaningful commitments. Implementers MAY choose internal helpers,
algorithms and local structures within those commitments. Changes to behaviour,
public contracts, ownership, dependencies or material security/cost/privacy MUST return
to the lead and renewed alignment. An ADR records important rationale, not every choice.

## Test surfaces and observability

You MUST prefer a few high-value integration/system tests over large counts of unit
tests in v2-built repositories. Test meaningful behaviour through caller-facing
interfaces; use real integrations or controlled external adapters where practical.
Unit tests MAY add distinct confidence for isolated complex logic.
You MUST NOT replace useful existing coverage solely to reduce a count or wrap every
internal helper in mock-heavy tests. Validate failures in orchestration/ordering too.

You SHOULD make dependencies and results explicit where it improves testability,
without banning needed side effects or creating interfaces only for a test.
You MUST include proportionate operational evidence: logs/metrics/traces and failure
diagnostics without sensitive data leakage. Relevant UI changes need running-app
visual evidence; backend changes need relevant API/integration evidence, not arbitrary
screenshots. Local checks MUST NOT be claimed as proof of cloud-only behaviour.

The standalone repository-wide architecture scan is deferred. Refactor only agreed,
in-scope friction; do not turn a feature into an unrequested architecture cleanup.

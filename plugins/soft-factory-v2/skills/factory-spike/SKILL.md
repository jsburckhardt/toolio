---
name: factory-spike
description: "Request approval for a bounded spike and produce evidence, options and exit results under docs/spikes."
metadata:
  author: "Soft Factory maintainers"
  spec_version: "1.0"
---

# Factory spike

Resolve a consequential unknown through an explicitly approved, bounded experiment.
Routine code/documentation lookup is research, not a spike.

1. Request approval through `ask_user`: question/decision, known facts, recommended
   method, scope/exclusions, time/effort bound, access/cost constraints and observable
   exit conditions. Wait for approval before experimental work.
2. Work within the agreed bounds and existing environment. Keep experimental code
   distinct from production. Record actual probes, sources, negative results and
   limitations without exposing secrets or private data.
3. At the bound, stop and report unanswered questions. Any extension needs approval;
   do not silently expand the experiment or promote it to production.
4. Write `docs/spikes/<date>-<slug>.md` with these sections:
   Question and decision; Approval and bounds; Evidence; Options and tradeoffs;
   Recommendation; Exit conditions/results; Unresolved questions and proposed delivery
   ACs/follow-ups; Experimental artifacts and disposition.
5. A useful non-viability result can be success. Return consequential findings to
   alignment; the spike's recommendation is not automatically an approved decision.

## References

Return to `soft-factory-v2:factory-align`.

## Skill layout

- `SKILL.md`: self-contained instructions.

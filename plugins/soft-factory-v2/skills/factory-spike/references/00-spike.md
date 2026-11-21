# Bounded approved spikes

## Request

Routine repository inspection/documentation lookup remains autonomous research. When
uncertainty could materially change the solution and needs experimental work, you
MUST request a spike through `ask_user` with a recommended scope and method.
You MUST wait for explicit approval before starting the experiment.

The request MUST state the decision/question, known facts, scope/exclusions,
time/effort bound, access/cost constraints, observable exit conditions and output path
under `docs/spikes/`. You MUST NOT invent credentials or obtain unrelated access.

## Execute

You MUST work within the approved scope and existing devcontainer. Disposable code
MUST stay distinct from production. Record commands and observations, including
negative results. You MUST NOT transmit private recordings/code to research services
or commit credentials, raw private data or secrets as evidence.
At the bound, you MUST stop and report what is still unknown; any extension needs
renewed approval. You MUST NOT enlarge the spike or silently ship experimental code.

## Output format

Write `docs/spikes/<date>-<slug>.md` (or an agreed file under that directory) with:

| Section | Required content |
|---|---|
| Question and decision | What choice the spike supports; related issue/work brief. |
| Approval and bounds | Approval source, method, scope/exclusions, effort limit and exit conditions. |
| Evidence | Commands/probes, observations, sources, limitations and reproducible results. |
| Options and tradeoffs | Viable approaches and load-bearing reasons to reject others. |
| Recommendation | Preferred option and confidence, including non-viability when established. |
| Exit result | Conditions met/not met, time/effort used and unanswered questions. |
| Delivery implications | Proposed ACs, prerequisites, follow-up tasks and decisions needing the owner. |
| Experimental artifacts | Locations and disposition: discard, retain as evidence or separately plan production work. |

Success means useful evidence against the exit conditions, not necessarily a viable
feature. You MUST feed consequential findings back into
`soft-factory-v2:factory-align`; do not assume the recommendation is approved.

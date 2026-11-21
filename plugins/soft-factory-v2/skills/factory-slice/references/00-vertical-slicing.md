# Slice outcomes, then schedule

## Outcomes and dependencies

You MUST start from agreed ACs and design. Each slice MUST demonstrate an observable
outcome across the layers it needs. The first slice SHOULD exercise a thin integrated
path, not the entire database layer followed by API and UI layers.
You MUST NOT invent horizontal tasks merely to keep workers occupied.

Record task ID, outcome, owned ACs, interface commitments, prerequisite IDs, write scope,
shared-file owner, runtime resources and validation commands in the canonical brief.
You MUST make every actual prerequisite explicit; list order is not dependency evidence.
You MUST reject cycles and unknown prerequisites.

One delivery issue has one integration branch and one final PR. Worker branches are
internal tasks. Oversized initiatives MUST split into useful delivery issues instead
of hiding a giant diff behind "one issue". PR-stack/fleet scheduling is outside the MVP.

## Ready work

You MUST default to sequential execution unless multiple ready tasks have stable
contracts, disjoint writes and separate mutable runtime resources. The initial limit
is two implementers. Shared-file churn or uncertain interfaces SHOULD keep tasks
sequential. Shared lockfiles/maps/indexes MUST have one owner, normally the lead.

You MUST unlock a dependant only after its prerequisites pass integration checks,
not when a worker exits or receives task review. A failed task blocks dependants;
unrelated ready work MAY proceed. Broken integration MUST stop dispatch until repaired.

## Dispatch snapshot

Use `soft-factory-v2:factory-deliver` after agreement. Export a local JSON execution
snapshot from the brief for the helper; it MUST NOT become a competing design record.
The delivery reference defines its schema. Capture task instructions, AC IDs, writes
and dependencies exactly. Paths are repo-relative files or directory prefixes ending
in `/`, not arbitrary glob expressions. Assign `.trees/` bookkeeping to the helper.

You MUST preserve the approved plan while workers run. If facts change, reconcile the
affected tasks and contracts through the lead before dispatching or integrating them.

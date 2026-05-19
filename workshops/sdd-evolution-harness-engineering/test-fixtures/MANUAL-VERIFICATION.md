# Manual Verification Procedures

Three manual procedures verify acceptance criteria that cannot be fully
automated. Run each in the devcontainer, then record the outcome below
the procedure.

## T-MANUAL-FACILITATOR-01 — Facilitator dry-run

**Goal:** A facilitator runs the published 90-minute condensed agenda end-to-end
inside the devcontainer.

**Steps:**
1. Open the workshop README and locate the 90-minute condensed agenda.
2. Execute every command in the agenda in order, in a fresh clone.
3. Note any command that failed or required improvisation.

**Pass criteria:** every command in the agenda runs as documented.

**Outcome (record here):**
```
[ ] Run on:  YYYY-MM-DD
[ ] By:      <facilitator name>
[ ] Result:  PASS / FAIL
[ ] Notes:
```

## T-MANUAL-TRAINEE-01 — Unprimed trainee

**Goal:** A trainee given only `workshops/sdd-evolution-harness-engineering/README.md`
reaches Module 2 within 25 minutes without external docs.

**Steps:**
1. Hand the trainee the workshop README only.
2. They start the workshop in a fresh clone via `workshop start`.
3. They reach `workshop run 02-sensors-first` and see at least one sensor fire.

**Pass criteria:** trainee reaches Module 2 ≤ 25 minutes and ≥ 1 sensor fires.

**Outcome (record here):**
```
[ ] Run on:  YYYY-MM-DD
[ ] Trainee: <name>
[ ] Time to Module 2:  ___ minutes
[ ] Sensors fired:     ___
[ ] Result:  PASS / FAIL
```

## T-MANUAL-META-01 — LLM meta-description

**Goal:** An AI agent given only `LLM.txt`, `tools/registry.json`, and this
workshop's `workshop.json` must describe what the workshop teaches and how to
start it.

**Steps:**
1. Feed an agent the three files above.
2. Ask: "What does this workshop teach and how do I start it?"
3. Inspect the answer for the keywords: harness engineering, RPIV invariants,
   `workshop start`, advanced difficulty.

**Pass criteria:** all four keywords mentioned.

**Outcome (record here):**
```
[ ] Run on:  YYYY-MM-DD
[ ] Agent:   <model + version>
[ ] Result:  PASS / FAIL
[ ] Notes:
```

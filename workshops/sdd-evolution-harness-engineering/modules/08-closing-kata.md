# Module 8 — Closing Kata

## Run

```bash
echo "  My closing answer  " | workshop coach kata
jq -r .kata .workshop-state.json
workshop reset
workshop reset    # idempotent — should be a no-op
```

## Harness Invariants

- Trainee's kata answer is stored verbatim (whitespace preserved).
- `workshop reset` is idempotent; second run prints "no-op".
- After reset, no `*workshop*` files remain under `.git/hooks/`.

## Debrief

- Which workshop invariant will you transplant first into your own repo?
- What is the smallest harness you can ship Monday?

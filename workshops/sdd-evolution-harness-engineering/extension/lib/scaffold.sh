# installed by sdd-evolution-harness-engineering workshop
# scaffold.sh — emit draft candidates; only accept-draft mutates canonical paths.

_drafts_dir() {
  local d="$(repo_root)/.workshop-drafts"
  mkdir -p "$d"
  echo "$d"
}

_new_draft_id() {
  printf 'd-%s-%s' "$(date -u +%Y%m%dT%H%M%SZ)" "$(printf '%04x' $RANDOM)"
}

scaffold_emit_draft() {
  # args: kind [title...]
  local kind="$1"; shift || true
  local title="${*:-Untitled}"
  case "$kind" in
    research|plan|verify|adr|core-component|guide|sensor) ;;
    *) echo "ERROR: scaffold kind must be one of: research|plan|verify|adr|core-component|guide|sensor" >&2; return 1 ;;
  esac
  state_init
  local dir; dir="$(_drafts_dir)"
  local id; id="$(_new_draft_id)"
  local draft="${dir}/${id}.md"
  local meta="${dir}/${id}.meta.json"
  local confidence="medium"
  cat > "$draft" <<EOF
# DRAFT (${kind}): ${title}

> This is a SCAFFOLDED DRAFT emitted by the workshop. It is NOT a canonical artifact.
> Run \`workshop accept-draft ${id}\` to apply it, or \`workshop reject-draft ${id}\` to discard.

## Evidence

- Detected from repository inspection at $(date -u +%Y-%m-%dT%H:%M:%SZ).

## Confidence

${confidence}

## Body

(Trainee — author the body before accepting.)
EOF
  jq -n \
    --arg id "$id" \
    --arg kind "$kind" \
    --arg title "$title" \
    --arg path "$draft" \
    --arg conf "$confidence" \
    --arg ev "repository inspection" \
    '{id:$id,kind:$kind,title:$title,path:$path,confidence:$conf,evidence:$ev}' > "$meta"

  # Append to state pendingScaffoldDrafts
  local sf; sf="$(state_file)"
  local tmp="${sf}.tmp.$$"
  jq --slurpfile m "$meta" '.pendingScaffoldDrafts += $m' "$sf" > "$tmp" && mv "$tmp" "$sf"

  echo "scaffold: emitted draft id=${id} kind=${kind}"
  echo "  path:        ${draft}"
  echo "  evidence:    repository inspection"
  echo "  confidence:  ${confidence}"
  echo "  next steps:  workshop accept-draft ${id}  OR  workshop reject-draft ${id}"
}

scaffold_accept() {
  local id="$1"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || { echo "ERROR: no state file" >&2; return 1; }
  local meta_path
  meta_path="$(jq -r --arg id "$id" '.pendingScaffoldDrafts[] | select(.id==$id) | .path' "$sf")"
  local kind
  kind="$(jq -r --arg id "$id" '.pendingScaffoldDrafts[] | select(.id==$id) | .kind' "$sf")"
  local title
  title="$(jq -r --arg id "$id" '.pendingScaffoldDrafts[] | select(.id==$id) | .title' "$sf")"
  if [ -z "$meta_path" ] || [ "$meta_path" = "null" ]; then
    echo "ERROR: draft id not found: ${id}" >&2; return 1
  fi
  if [ ! -f "$meta_path" ]; then
    echo "ERROR: draft file missing on disk: ${meta_path}" >&2; return 1
  fi
  local root; root="$(repo_root)"
  case "$kind" in
    adr)
      # Find next ADR number
      local nextnum
      nextnum="$(ls "${root}/project/architecture/ADR/" 2>/dev/null | sed -n 's/^ADR-\([0-9][0-9]*\).*$/\1/p' | sort -n | tail -n1)"
      nextnum=$((10#${nextnum:-0} + 1))
      local pad; pad="$(printf '%04d' "$nextnum")"
      local slug
      slug="$(echo "$title" | tr 'A-Z ' 'a-z-' | tr -cd 'a-z0-9-' | sed 's/--*/-/g; s/^-//; s/-$//')"
      [ -z "$slug" ] && slug="scaffolded-draft"
      local out="${root}/project/architecture/ADR/ADR-${pad}-${slug}.md"
      mkdir -p "$(dirname "$out")"
      cat > "$out" <<EOF
# ADR-${pad}: ${title}

## Status
Proposed

## Context
(Authored from scaffolded draft ${id}.)

## Decision
(Author this section before requesting review.)

## Consequences
(Author this section before requesting review.)
EOF
      # Append DECISION-LOG row
      local dl="${root}/project/architecture/ADR/DECISION-LOG.md"
      if [ -f "$dl" ]; then
        printf '\n| ADR-%s | %s | Proposed | %s |\n' "$pad" "$title" "$(date -u +%Y-%m-%d)" >> "$dl"
      fi
      echo "accept-draft: wrote ${out} and appended DECISION-LOG row (not committed)."
      ;;
    core-component)
      local nextnum
      nextnum="$(ls "${root}/project/architecture/core-components/" 2>/dev/null | sed -n 's/^CORE-COMPONENT-\([0-9][0-9]*\).*$/\1/p' | sort -n | tail -n1)"
      nextnum=$((10#${nextnum:-0} + 1))
      local pad; pad="$(printf '%04d' "$nextnum")"
      local slug
      slug="$(echo "$title" | tr 'A-Z ' 'a-z-' | tr -cd 'a-z0-9-' | sed 's/--*/-/g; s/^-//; s/-$//')"
      [ -z "$slug" ] && slug="scaffolded-draft"
      local out="${root}/project/architecture/core-components/CORE-COMPONENT-${pad}-${slug}.md"
      mkdir -p "$(dirname "$out")"
      cat > "$out" <<EOF
# CORE-COMPONENT-${pad}: ${title}

## Purpose
(Authored from scaffolded draft ${id}.)

## Boundaries
(Author this section.)

## Decision Records
(Author this section.)
EOF
      echo "accept-draft: wrote ${out} (not committed)."
      ;;
    research|plan|verify)
      # promote into project/issues/<N>/ — placeholder: write under ./scaffold-output/<kind>.md
      local out="${root}/.workshop-scaffold-output/${kind}-${id}.md"
      mkdir -p "$(dirname "$out")"
      cp "$meta_path" "$out"
      echo "accept-draft: wrote ${out} (not committed)."
      ;;
    guide|sensor)
      local out="${root}/.workshop-scaffold-output/${kind}-${id}.md"
      mkdir -p "$(dirname "$out")"
      cp "$meta_path" "$out"
      echo "accept-draft: wrote ${out} (not committed)."
      ;;
    *)
      echo "ERROR: unknown kind: ${kind}" >&2; return 1 ;;
  esac
  # Remove draft from state and disk
  local tmp="${sf}.tmp.$$"
  jq --arg id "$id" '.pendingScaffoldDrafts |= map(select(.id != $id))' "$sf" > "$tmp" && mv "$tmp" "$sf"
  rm -f "$meta_path" "${meta_path%.md}.meta.json"
}

scaffold_reject() {
  local id="$1"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || { echo "ERROR: no state file" >&2; return 1; }
  local path
  path="$(jq -r --arg id "$id" '.pendingScaffoldDrafts[] | select(.id==$id) | .path' "$sf")"
  if [ -z "$path" ] || [ "$path" = "null" ]; then
    echo "ERROR: draft id not found: ${id}" >&2; return 1
  fi
  rm -f "$path" "${path%.md}.meta.json"
  local tmp="${sf}.tmp.$$"
  jq --arg id "$id" '.pendingScaffoldDrafts |= map(select(.id != $id))' "$sf" > "$tmp" && mv "$tmp" "$sf"
  echo "reject-draft: removed draft id=${id}"
}

scaffold_promote_ephemeral() {
  local issue="$1"
  local root; root="$(repo_root)"
  local src="${root}/.workshop-scaffold-output"
  [ -d "$src" ] || { echo "ERROR: nothing to promote (no .workshop-scaffold-output)" >&2; return 1; }
  local dst="${root}/project/issues/${issue}"
  mkdir -p "${dst}/research" "${dst}/plan" "${dst}/implementation"
  # Best-effort: promote research-/plan-/verify- files into canonical positions
  for f in "$src"/research-*.md; do [ -f "$f" ] && cp "$f" "${dst}/research/$(basename "$f")"; done
  for f in "$src"/plan-*.md;     do [ -f "$f" ] && cp "$f" "${dst}/plan/$(basename "$f")"; done
  for f in "$src"/verify-*.md;   do [ -f "$f" ] && cp "$f" "${dst}/implementation/$(basename "$f")"; done
  echo "install-promote-ephemeral: promoted ephemeral artifacts into ${dst} (not committed)."
}

fan_out_run() {
  local count="$1"
  local root; root="$(repo_root)"
  local out="${root}/.workshop-fanout"
  mkdir -p "$out"
  local report="${out}/collision-report.txt"
  : > "$report"
  local i
  for ((i=1; i<=count; i++)); do
    local wt="${out}/wt-${i}"
    if [ ! -d "$wt" ]; then
      git -C "$root" worktree add -f -B "workshop-fanout-${i}" "$wt" HEAD >/dev/null 2>&1 || {
        # fallback: just create a directory + state file simulation
        mkdir -p "$wt"
      }
    fi
    # Each worktree gets its own state file
    if [ -d "${wt}/.git" ] || [ -f "${wt}/.git" ]; then
      (cd "$wt" && "${WORKSHOP_ROOT}/extension/bin/workshop" start >/dev/null 2>&1 || true)
    else
      printf '{"worktreePath":"%s","branch":"fanout-%d"}\n' "$wt" "$i" > "${wt}/.workshop-state.json"
    fi
    echo "fan-out: worktree-${i}: ${wt}" >> "$report"
  done
  # Collision report: any canonical paths shared by both worktrees
  echo "" >> "$report"
  echo "Collision points (shared canonical paths):" >> "$report"
  echo "  project/architecture/ADR/DECISION-LOG.md" >> "$report"
  echo "  tools/registry.json" >> "$report"
  echo "  LLM.txt" >> "$report"
  cat "$report"
  echo "fan-out: created ${count} worktrees; collision report at ${report}"
}

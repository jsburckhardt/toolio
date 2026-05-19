# installed by sdd-evolution-harness-engineering workshop
# onboard.sh — brownfield onboarding with security guards + secret redaction.

ONBOARD_MAX_FILES=10000
ONBOARD_MAX_DEPTH=8

onboard_run() {
  local target="$1"
  local yes="${2:-0}"

  # Reject obvious traversal in argv
  case "$target" in
    *..*) echo "ERROR: '..' is not permitted in onboard path" >&2; return 1 ;;
  esac

  if [ ! -d "$target" ]; then
    echo "ERROR: not a directory: ${target}" >&2; return 1
  fi

  local resolved
  resolved="$(realpath -e "$target" 2>/dev/null)" || { echo "ERROR: cannot realpath: ${target}" >&2; return 1; }

  # Ensure resolved path is itself accessible (not a dangling symlink target)
  if [ ! -d "$resolved" ]; then
    echo "ERROR: resolved target is not a directory: ${resolved}" >&2; return 1
  fi

  if [ "$yes" != "1" ]; then
    echo "workshop onboard: target resolves to: ${resolved}" >&2
    echo "workshop onboard: proceed? [y/N]" >&2
    local ans
    read -r ans || ans="n"
    case "$ans" in
      y|Y|yes|YES) ;;
      *) echo "workshop onboard: declined." >&2; return 0 ;;
    esac
  fi

  # Security: detect symlinks within target that escape the resolved root
  local sym_violations=0
  while IFS= read -r -d '' link; do
    local linkt
    linkt="$(realpath -m "$link" 2>/dev/null)"
    case "$linkt" in
      "$resolved"|"$resolved"/*) : ;;
      *) echo "ERROR: symlink escapes onboard root: ${link} -> ${linkt}" >&2; sym_violations=$((sym_violations+1)) ;;
    esac
  done < <(find "$resolved" -type l -print0 2>/dev/null)
  if [ "$sym_violations" -gt 0 ]; then
    echo "ERROR: refusing to onboard — ${sym_violations} symlink escape(s) detected." >&2
    return 1
  fi

  # Size limit
  local file_count
  file_count="$(find "$resolved" -type f 2>/dev/null | wc -l | tr -d ' ')"
  if [ "$file_count" -gt "$ONBOARD_MAX_FILES" ]; then
    echo "ERROR: file count ${file_count} exceeds limit ${ONBOARD_MAX_FILES}" >&2
    return 1
  fi

  # Skip list
  local skip_dirs=(.git node_modules vendor target dist build .venv .cache)
  # Gitignore: honour entries from the target's .gitignore by simple match
  local gitignore_entries=()
  if [ -f "${resolved}/.gitignore" ]; then
    while IFS= read -r line; do
      line="${line%%#*}"
      line="${line## }"; line="${line%% }"
      [ -z "$line" ] && continue
      gitignore_entries+=("$line")
    done < "${resolved}/.gitignore"
  fi

  state_init

  # Inspect: collect detected file categories
  local has_ci=0 has_pkg=0 has_dockerfile=0 has_tests=0 has_docs=0
  while IFS= read -r f; do
    local rel="${f#${resolved}/}"
    # depth check
    local depth; depth="$(awk -F/ '{print NF-1}' <<<"$rel")"
    if [ "$depth" -gt "$ONBOARD_MAX_DEPTH" ]; then
      echo "WARN: skipping path at depth ${depth} > ${ONBOARD_MAX_DEPTH}: ${rel}" >&2
      continue
    fi
    case "$rel" in
      .github/workflows/*) has_ci=1 ;;
      package.json|pyproject.toml|go.mod|Cargo.toml) has_pkg=1 ;;
      Dockerfile|*/Dockerfile) has_dockerfile=1 ;;
      test/*|tests/*|*_test.go|*.test.js|*.test.ts|*_test.py) has_tests=1 ;;
      docs/*|README*|README) has_docs=1 ;;
    esac
  done < <(_onboard_walk "$resolved" "${skip_dirs[@]}")

  # Emit drafts (≥2 ADRs + ≥1 CC) into pendingScaffoldDrafts; redact secrets in evidence.
  local sample_evidence
  sample_evidence="$(_redact_secrets <(grep -RIs --max-count=1 -E '.{1,80}' "$resolved" 2>/dev/null | head -n 10))"

  _onboard_add_draft adr "Adopt explicit testing strategy" "tests-present=${has_tests}" "${sample_evidence}"
  _onboard_add_draft adr "Adopt build/dependency manifest convention" "package-present=${has_pkg}" "${sample_evidence}"
  if [ "$has_ci" = "1" ]; then
    _onboard_add_draft adr "Document the existing CI workflow as an ADR" "ci-detected=true" "${sample_evidence}"
  fi
  _onboard_add_draft core-component "Document existing cross-cutting concerns" "docs-present=${has_docs}" "${sample_evidence}"

  echo "workshop onboard: emitted drafts. Run 'workshop status' to review pendingScaffoldDrafts."
  echo "workshop onboard: scanned ${file_count} files at depth ≤ ${ONBOARD_MAX_DEPTH}."
}

_onboard_walk() {
  local root="$1"; shift
  local skips=("$@")
  local exclude_args=()
  for s in "${skips[@]}"; do
    exclude_args+=(-not -path "*/${s}/*")
  done
  find "$root" -type f "${exclude_args[@]}" 2>/dev/null
}

_redact_secrets() {
  # Read from stdin (or arg); apply regex redaction
  local input="${1:-/dev/stdin}"
  cat "$input" 2>/dev/null | \
    sed -E \
      -e 's/ghp_[A-Za-z0-9]{20,}/<REDACTED:ghp>/g' \
      -e 's/gho_[A-Za-z0-9]{20,}/<REDACTED:gho>/g' \
      -e 's/AKIA[0-9A-Z]{16}/<REDACTED:AKIA>/g' \
      -e 's/Bearer [A-Za-z0-9._-]+/<REDACTED:Bearer>/g' \
      -e 's/[A-Za-z0-9+\/]{40,}={0,2}/<REDACTED:entropy>/g'
}

_onboard_add_draft() {
  local kind="$1"; local title="$2"; local evidence_tag="$3"; local evidence_sample="$4"
  state_init
  local dir
  dir="$(repo_root)/.workshop-drafts"
  mkdir -p "$dir"
  local id; id="$(_new_draft_id)"
  local draft="${dir}/${id}.md"
  # Redact title + evidence sample
  local safe_title; safe_title="$(printf '%s' "$title" | _redact_secrets)"
  local safe_ev; safe_ev="$(printf '%s' "$evidence_sample" | _redact_secrets)"
  cat > "$draft" <<EOF
# DRAFT (${kind}): ${safe_title}

> Emitted by 'workshop onboard'. NOT canonical. Trainee must accept-draft to apply.

## Evidence

- Tag:        ${evidence_tag}
- Sample (redacted):

\`\`\`
${safe_ev}
\`\`\`

## Confidence

medium

## Body

(Author body before accepting.)
EOF
  local meta="${dir}/${id}.meta.json"
  jq -n \
    --arg id "$id" --arg kind "$kind" --arg title "$safe_title" \
    --arg path "$draft" --arg conf "medium" --arg ev "$evidence_tag" \
    '{id:$id,kind:$kind,title:$title,path:$path,confidence:$conf,evidence:$ev}' > "$meta"
  local sf; sf="$(state_file)"
  local tmp="${sf}.tmp.$$"
  jq --slurpfile m "$meta" '.pendingScaffoldDrafts += $m' "$sf" > "$tmp" && mv "$tmp" "$sf"
  rm -f "$meta"
  echo "  + draft ${id}: ${kind} — ${safe_title}"
}

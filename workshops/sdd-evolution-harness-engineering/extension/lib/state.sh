# installed by sdd-evolution-harness-engineering workshop
# state.sh — JSON state file management. Pure jq; no embedded file contents.

repo_root() {
  git rev-parse --show-toplevel 2>/dev/null || pwd
}

git_common_dir() {
  local gcd
  gcd="$(git rev-parse --git-common-dir 2>/dev/null || echo .git)"
  if [[ "$gcd" = /* ]]; then echo "$gcd"; else echo "$(repo_root)/${gcd}"; fi
}

state_file() {
  echo "$(repo_root)/.workshop-state.json"
}

state_init() {
  local sf; sf="$(state_file)"
  if [ -f "$sf" ]; then return 0; fi
  local gcd branch head
  gcd="$(git_common_dir)"
  branch="$(git -C "$(repo_root)" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  head="$(git -C "$(repo_root)" rev-parse HEAD 2>/dev/null || echo unknown)"
  jq -n \
    --arg gcd "$gcd" \
    --arg wtp "$(repo_root)" \
    --arg br "$branch" \
    --arg sha "$head" \
    '{
      gitCommonDir: $gcd,
      worktreePath: $wtp,
      branch: $br,
      headSha: $sha,
      currentModule: "module-0",
      invariantsMet: false,
      installedHooks: [],
      overrideLedger: [],
      pendingScaffoldDrafts: [],
      kata: ""
    }' > "$sf"
}

state_get() {
  local key="$1"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || return 1
  jq -r --arg k "$key" '.[$k] // empty' "$sf"
}

state_set() {
  local key="$1"; shift
  local val="$*"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || state_init
  local tmp; tmp="${sf}.tmp.$$"
  jq --arg k "$key" --arg v "$val" '.[$k] = $v' "$sf" > "$tmp" && mv "$tmp" "$sf"
}

state_set_bool() {
  local key="$1"; local val="$2"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || state_init
  local tmp; tmp="${sf}.tmp.$$"
  jq --arg k "$key" --argjson v "$val" '.[$k] = $v' "$sf" > "$tmp" && mv "$tmp" "$sf"
}

state_advance_module() {
  local cur; cur="$(state_get currentModule)"
  local n="${cur#module-}"
  n=$((n + 1))
  state_set currentModule "module-${n}"
}

state_record_override() {
  local reason="$1"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || state_init
  local tmp; tmp="${sf}.tmp.$$"
  local ts; ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  jq --arg r "$reason" --arg t "$ts" \
    '.overrideLedger += [{"reason": $r, "timestamp": $t, "consumed": false}]' \
    "$sf" > "$tmp" && mv "$tmp" "$sf"
}

state_consume_override() {
  # mark the most-recent unconsumed override as consumed; return 0 if consumed, 1 otherwise
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || return 1
  local has
  has="$(jq '[.overrideLedger[] | select(.consumed == false)] | length' "$sf")"
  if [ "$has" -lt 1 ]; then return 1; fi
  local tmp; tmp="${sf}.tmp.$$"
  jq '
    (.overrideLedger | map(select(.consumed == false)) | length) as $n
    | if $n > 0 then
        (.overrideLedger |= ([foreach .[] as $e ({consumed:false}; .;
          if ($e.consumed == false and .consumed == false) then ($e | .consumed = true) else $e end
        )]))
      else . end
  ' "$sf" > "$tmp" 2>/dev/null || {
    # simpler fallback: flip first false
    jq '
      def flip:
        if length == 0 then []
        elif .[0].consumed == false then [.[0] + {consumed:true}] + .[1:]
        else [.[0]] + (.[1:] | flip) end;
      .overrideLedger |= flip
    ' "$sf" > "$tmp"
  }
  mv "$tmp" "$sf"
  return 0
}

state_get_installed_hooks_summary() {
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || { echo " (none)"; return; }
  jq -r '.installedHooks | if length == 0 then " (none)" else " " + ([.[].name] | join(", ")) end' "$sf"
}

state_get_override_ledger_summary() {
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || { echo " (none)"; return; }
  jq -r '.overrideLedger | if length == 0 then " (none)" else " " + (map("[" + (if .consumed then "USED" else "ACTIVE" end) + " " + .reason + "]") | join(", ")) end' "$sf"
}

state_get_pending_drafts_summary() {
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || { echo " (none)"; return; }
  jq -r '.pendingScaffoldDrafts | if length == 0 then " (none)" else " " + ([.[].id] | join(", ")) end' "$sf"
}

state_add_installed_hook() {
  # args: name backupPath
  local name="$1"; local backup="$2"
  local sf; sf="$(state_file)"
  [ -f "$sf" ] || state_init
  local tmp; tmp="${sf}.tmp.$$"
  jq --arg n "$name" --arg b "$backup" \
    '.installedHooks += [{"name": $n, "backup": $b}]' "$sf" > "$tmp" && mv "$tmp" "$sf"
}

state_emit_json() {
  local drift="${1:-}"
  local sf; sf="$(state_file)"
  if [ ! -f "$sf" ]; then
    printf '{"state":null,"drift":"%s"}\n' "$drift"
    return 0
  fi
  jq --arg drift "$drift" '. + {drift: $drift}' "$sf"
}

ensure_gitignore_entry() {
  local entry="$1"
  local gi; gi="$(repo_root)/.gitignore"
  if [ ! -f "$gi" ]; then touch "$gi"; fi
  if ! grep -qxF "$entry" "$gi"; then
    printf '%s\n' "$entry" >> "$gi"
  fi
}

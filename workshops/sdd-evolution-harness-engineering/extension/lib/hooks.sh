# installed by sdd-evolution-harness-engineering workshop
# hooks.sh — install computational sensors as git hooks; chain after existing ones.

hooks_install() {
  local root; root="$(repo_root)"
  local hooks_dir; hooks_dir="$(git -C "$root" rev-parse --git-path hooks 2>/dev/null)"
  if [[ "$hooks_dir" != /* ]]; then hooks_dir="${root}/${hooks_dir}"; fi
  mkdir -p "$hooks_dir"

  # Detect framework
  local framework="raw"
  if [ -d "${root}/.husky" ]; then framework="husky"; fi
  if [ -f "${root}/.pre-commit-config.yaml" ]; then framework="pre-commit"; fi

  # Install three sensors at distinct hook entrypoints
  _install_one "pre-commit" "$framework" "${WORKSHOP_HOOKS}/pre-commit-research-gate" "$hooks_dir"
  # Additional sensors install as standalone scripts plus invocation from pre-commit
  _install_sensor_alongside "pre-commit-plan-gate" "${WORKSHOP_HOOKS}/pre-commit-plan-gate" "$hooks_dir"
  _install_sensor_alongside "pre-pr-verify-gate" "${WORKSHOP_HOOKS}/pre-pr-verify-gate" "$hooks_dir"

  echo "workshop install-hooks: framework=${framework}; sensors installed."
}

_install_one() {
  # args: hook-name framework sensor-template hooks-dir
  local name="$1"; local framework="$2"; local template="$3"; local hooks_dir="$4"
  local target="${hooks_dir}/${name}"
  local backup=""
  if [ -f "$target" ]; then
    # already installed by us? skip if marker present on line 1
    if head -n1 "$target" 2>/dev/null | grep -qF "$WORKSHOP_MARKER"; then
      return 0
    fi
    backup="${target}.workshop-backup.$(date -u +%s)"
    cp -p "$target" "$backup"
  fi
  cat > "$target" <<EOF
${WORKSHOP_MARKER}
#!/usr/bin/env bash
# Auto-installed wrapper that chains the prior ${name} hook then runs the workshop sensor.
set -e
HOOK_BACKUP="${backup}"
SENSOR_TEMPLATE="${template}"
WORKSHOP_ROOT="${WORKSHOP_ROOT}"

if [ -n "\$HOOK_BACKUP" ] && [ -x "\$HOOK_BACKUP" ]; then
  "\$HOOK_BACKUP" "\$@" || exit \$?
elif [ -n "\$HOOK_BACKUP" ] && [ -f "\$HOOK_BACKUP" ]; then
  bash "\$HOOK_BACKUP" "\$@" || exit \$?
fi

# Honour 'workshop override' (one-commit bypass)
if [ -f "\$(git rev-parse --show-toplevel 2>/dev/null)/.workshop-state.json" ]; then
  if "\${WORKSHOP_ROOT}/extension/bin/workshop" status --json 2>/dev/null \\
      | jq -e '.overrideLedger | map(select(.consumed == false)) | length > 0' >/dev/null 2>&1; then
    # consume one override
    (cd "\$(git rev-parse --show-toplevel)" && "\${WORKSHOP_ROOT}/extension/bin/workshop" status >/dev/null 2>&1 || true)
    # invoke consume via dedicated helper command (delegated through reconcile-style state mutation)
    "\${WORKSHOP_ROOT}/extension/bin/workshop" override --reason "__consume__" >/dev/null 2>&1 || true
    exit 0
  fi
fi

exec bash "\$SENSOR_TEMPLATE" "\$@"
EOF
  chmod +x "$target"
  state_add_installed_hook "$name" "$backup"
}

_install_sensor_alongside() {
  # args: filename template hooks-dir
  local name="$1"; local template="$2"; local hooks_dir="$3"
  local target="${hooks_dir}/${name}"
  if [ -f "$target" ]; then
    if head -n1 "$target" 2>/dev/null | grep -qF "$WORKSHOP_MARKER"; then return 0; fi
    local backup="${target}.workshop-backup.$(date -u +%s)"
    cp -p "$target" "$backup"
    state_add_installed_hook "$name" "$backup"
  else
    state_add_installed_hook "$name" ""
  fi
  cp "$template" "$target"
  # Ensure marker on line 1
  if ! head -n1 "$target" | grep -qF "$WORKSHOP_MARKER"; then
    local tmp; tmp="${target}.tmp.$$"
    { echo "$WORKSHOP_MARKER"; echo "#!/usr/bin/env bash"; cat "$target"; } > "$tmp"
    mv "$tmp" "$target"
  fi
  chmod +x "$target"
}

hooks_restore_all() {
  # args: array name (passed by ref via nameref)
  local -n _removed_ref="$1"
  local root; root="$(repo_root)"
  local hooks_dir; hooks_dir="$(git -C "$root" rev-parse --git-path hooks 2>/dev/null)"
  if [[ "$hooks_dir" != /* ]]; then hooks_dir="${root}/${hooks_dir}"; fi
  [ -d "$hooks_dir" ] || return 0
  local sf; sf="$(state_file)"
  if [ -f "$sf" ]; then
    while IFS=$'\t' read -r name backup; do
      [ -z "$name" ] && continue
      local target="${hooks_dir}/${name}"
      if [ -f "$target" ] && head -n1 "$target" 2>/dev/null | grep -qF "$WORKSHOP_MARKER"; then
        rm -f "$target"
        _removed_ref+=("$target")
      fi
      if [ -n "$backup" ] && [ -f "$backup" ]; then
        cp -p "$backup" "$target"
        rm -f "$backup"
        _removed_ref+=("(restored) $target")
      fi
    done < <(jq -r '.installedHooks[] | "\(.name)\t\(.backup)"' "$sf" 2>/dev/null)
  fi
  # Belt-and-braces sweep: remove any file in hooks_dir whose line-1 carries our marker
  for f in "$hooks_dir"/*; do
    [ -f "$f" ] || continue
    if head -n1 "$f" 2>/dev/null | grep -qF "$WORKSHOP_MARKER"; then
      rm -f "$f"
      _removed_ref+=("$f")
    fi
  done
  # Remove orphan backups
  for f in "$hooks_dir"/*.workshop-backup.*; do
    [ -f "$f" ] || continue
    rm -f "$f"
    _removed_ref+=("$f")
  done
}

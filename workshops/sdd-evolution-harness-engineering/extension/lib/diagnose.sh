# installed by sdd-evolution-harness-engineering workshop
# diagnose.sh — 2x2 inspector (computational/inferential × guides/sensors)

diagnose_2x2() {
  local as_json="${1:-0}"
  local root; root="$(repo_root)"
  local cg=() ig=() cs=() is=()

  # Computational guides: scripts, schemas, CI configs
  for f in "$root"/scripts/*.sh "$root"/schemas/*.json; do
    [ -f "$f" ] && cg+=("${f#$root/}")
  done

  # Inferential guides: agent prompt files
  for f in "$root"/.github/agents/*.md "$root"/.github/agents/*/*.md; do
    [ -f "$f" ] && ig+=("${f#$root/}")
  done

  # Computational sensors: installed git hooks
  local hooks_dir; hooks_dir="$(git -C "$root" rev-parse --git-path hooks 2>/dev/null || echo .git/hooks)"
  if [[ "$hooks_dir" != /* ]]; then hooks_dir="${root}/${hooks_dir}"; fi
  if [ -d "$hooks_dir" ]; then
    for f in "$hooks_dir"/*; do
      [ -f "$f" ] || continue
      case "$(basename "$f")" in *.sample) continue ;; esac
      cs+=(".git/hooks/$(basename "$f")")
    done
  fi

  # Inferential sensors: prompt files explicitly marked as sensors / coach prompts
  for f in "$root"/.github/agents/*sensor*.md "$root"/.github/agents/*coach*.md \
           "${WORKSHOP_ROOT}/extension/lib/prompts/"*sensor*.prompt.md; do
    [ -f "$f" ] && is+=("${f#$root/}")
  done

  if [ "$as_json" = "1" ]; then
    _emit_json_arr() {
      local sep=""
      printf '['
      for x in "${@}"; do
        printf '%s"%s"' "$sep" "$x"
        sep=","
      done
      printf ']'
    }
    printf '{"computational_guides":'
    _emit_json_arr "${cg[@]}"
    printf ',"inferential_guides":'
    _emit_json_arr "${ig[@]}"
    printf ',"computational_sensors":'
    _emit_json_arr "${cs[@]}"
    printf ',"inferential_sensors":'
    _emit_json_arr "${is[@]}"
    printf ',"empty_quadrants":['
    local emptied=()
    [ ${#cg[@]} -eq 0 ] && emptied+=('"computational_guides"')
    [ ${#ig[@]} -eq 0 ] && emptied+=('"inferential_guides"')
    [ ${#cs[@]} -eq 0 ] && emptied+=('"computational_sensors"')
    [ ${#is[@]} -eq 0 ] && emptied+=('"inferential_sensors"')
    local sep=""
    for e in "${emptied[@]}"; do printf '%s%s' "$sep" "$e"; sep=","; done
    printf '],"suggestions":['
    sep=""
    [ ${#cg[@]} -eq 0 ] && { printf '%s"scaffold guide"' "$sep"; sep=","; }
    [ ${#ig[@]} -eq 0 ] && { printf '%s"scaffold guide"' "$sep"; sep=","; }
    [ ${#cs[@]} -eq 0 ] && { printf '%s"scaffold sensor"' "$sep"; sep=","; }
    [ ${#is[@]} -eq 0 ] && { printf '%s"scaffold sensor"' "$sep"; sep=","; }
    printf ']}\n'
    return 0
  fi

  echo "diagnose 2x2"
  echo "  computational guides  (${#cg[@]}): ${cg[*]:-(empty — propose: workshop scaffold guide)}"
  echo "  inferential guides    (${#ig[@]}): ${ig[*]:-(empty — propose: workshop scaffold guide)}"
  echo "  computational sensors (${#cs[@]}): ${cs[*]:-(empty — propose: workshop scaffold sensor)}"
  echo "  inferential sensors   (${#is[@]}): ${is[*]:-(empty — propose: workshop scaffold sensor)}"
}

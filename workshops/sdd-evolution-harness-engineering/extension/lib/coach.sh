# installed by sdd-evolution-harness-engineering workshop
# coach.sh — dispatch coach prompt files; record kata answers verbatim.

coach_dispatch() {
  local topic="$1"; shift || true
  local prompts_dir="${WORKSHOP_LIB}/prompts"
  case "$topic" in
    kata)
      coach_kata
      return $?
      ;;
    *)
      local p="${prompts_dir}/${topic}.prompt.md"
      if [ ! -f "$p" ]; then
        echo "ERROR: no coach prompt for topic '${topic}'. Available:" >&2
        ls "$prompts_dir" 2>/dev/null | sed 's/\.prompt\.md$//' >&2
        return 1
      fi
      # If SDK is unavailable, we already printed the banner. Still print prompt so the
      # trainee sees the critique categories they would have received.
      echo "# coach: ${topic}"
      cat "$p"
      # Heuristic critique: scan for a research brief at project/issues/<N>/research/00-research.md
      _coach_heuristic_critique "$topic"
      return 0
      ;;
  esac
}

_coach_heuristic_critique() {
  local topic="$1"
  case "$topic" in
    post-research-coach)
      # Look for a research file in argv-provided path, or fallback to most recent
      local rb=""
      for arg in "${ARGS[@]:1}"; do
        if [ -f "$arg" ]; then rb="$arg"; break; fi
      done
      if [ -z "$rb" ]; then
        rb="$(ls -1t "$(repo_root)"/project/issues/*/research/00-research.md 2>/dev/null | head -n1)"
      fi
      if [ -n "$rb" ] && [ -f "$rb" ]; then
        local lines; lines="$(wc -l <"$rb")"
        if [ "$lines" -lt 80 ]; then
          echo ""
          echo "# critique-category: thinness"
          echo "The research brief at ${rb} appears thin (${lines} lines). Consider adding evidence."
        fi
      fi
      ;;
  esac
}

coach_kata() {
  # Read verbatim from stdin (preserve whitespace). Use cat to handle missing trailing newline.
  local answer
  answer="$(cat)"
  state_init
  local sf; sf="$(state_file)"
  local tmp="${sf}.tmp.$$"
  jq --arg a "$answer" '.kata = $a' "$sf" > "$tmp" && mv "$tmp" "$sf"
  echo "coach kata: recorded answer (length=${#answer})"
}

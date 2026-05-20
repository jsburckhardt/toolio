#!/usr/bin/env bash
# lib/state.sh — State management helpers for .pipeline-state.json
# Sourced by bin/pipeline-controller; not executed directly.

# Returns the path to the state file (repo root)
state_file_path() {
  local root
  root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
  echo "$root/.pipeline-state.json"
}

# Creates initial state file for an issue
# Usage: state_init <issue_number>
state_init() {
  local issue_number="$1"
  local state_file
  state_file="$(state_file_path)"

  if [[ -f "$state_file" ]]; then
    return 0
  fi

  local repo=""
  if command -v gh &>/dev/null; then
    repo="$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo "")"
  fi

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local state
  state=$(jq -n \
    --argjson issue "$issue_number" \
    --arg repo "$repo" \
    --arg now "$now" \
    '{
      issue: $issue,
      repo: $repo,
      stages: [
        {id: "research", name: "Research", status: "ready", updatedAt: $now},
        {id: "plan", name: "Plan", status: "locked", updatedAt: $now},
        {id: "implement", name: "Implement", status: "locked", updatedAt: $now},
        {id: "verify", name: "Verify", status: "locked", updatedAt: $now}
      ],
      createdAt: $now,
      lastUpdated: $now
    }')

  _state_write "$state"
}

# Reads the current state file to stdout
state_read() {
  local state_file
  state_file="$(state_file_path)"
  if [[ ! -f "$state_file" ]]; then
    echo "ERROR: State file not found: $state_file" >&2
    return 1
  fi
  cat "$state_file"
}

# Gets the status of a specific stage
# Usage: state_get_stage <stage_id>
state_get_stage() {
  local stage_id="$1"
  local state_file
  state_file="$(state_file_path)"

  if [[ ! -f "$state_file" ]]; then
    echo "ERROR: State file not found" >&2
    return 1
  fi

  jq -r --arg id "$stage_id" '.stages[] | select(.id == $id) | .status' "$state_file"
}

# Sets the status of a specific stage with gating logic
# Usage: state_set_stage <stage_id> <status>
state_set_stage() {
  local stage_id="$1"
  local new_status="$2"
  local state_file
  state_file="$(state_file_path)"

  if [[ ! -f "$state_file" ]]; then
    echo "ERROR: State file not found" >&2
    return 1
  fi

  # Validate status value
  case "$new_status" in
    ready|running|done|failed|locked) ;;
    *)
      echo "ERROR: Invalid status: $new_status" >&2
      return 1
      ;;
  esac

  # Validate transition: cannot set a locked stage to done or running
  local current_status
  current_status="$(state_get_stage "$stage_id")"

  if [[ "$current_status" == "locked" && "$new_status" != "ready" ]]; then
    echo "ERROR: Cannot transition locked stage '$stage_id' to '$new_status'" >&2
    return 1
  fi

  local now
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  local updated
  updated=$(jq \
    --arg id "$stage_id" \
    --arg status "$new_status" \
    --arg now "$now" \
    '(.stages[] | select(.id == $id)) |= (.status = $status | .updatedAt = $now) | .lastUpdated = $now' \
    "$state_file")

  # Gating logic: if a stage becomes "done", set the next stage to "ready"
  if [[ "$new_status" == "done" ]]; then
    local stage_order=("research" "plan" "implement" "verify")
    local next_stage=""
    for i in "${!stage_order[@]}"; do
      if [[ "${stage_order[$i]}" == "$stage_id" ]]; then
        local next_idx=$((i + 1))
        if [[ $next_idx -lt ${#stage_order[@]} ]]; then
          next_stage="${stage_order[$next_idx]}"
        fi
        break
      fi
    done

    if [[ -n "$next_stage" ]]; then
      updated=$(echo "$updated" | jq \
        --arg id "$next_stage" \
        --arg now "$now" \
        '(.stages[] | select(.id == $id)) |= (if .status == "locked" then .status = "ready" | .updatedAt = $now else . end)')
    fi
  fi

  _state_write "$updated"
}

# Internal: write state to file with optional locking
_state_write() {
  local content="$1"
  local state_file
  state_file="$(state_file_path)"

  if command -v flock &>/dev/null; then
    (
      flock -x 200
      echo "$content" > "$state_file"
    ) 200>"${state_file}.lock"
  else
    echo "$content" > "$state_file"
  fi
}

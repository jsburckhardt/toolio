#!/usr/bin/env bash
# scripts/rebuild-registry.sh
# Regenerates tools/registry.json from tool and workshop manifests on disk.
# Requires: jq
set -euo pipefail

# --- Dependency check ---
if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required but not installed. Install it with: apt-get install jq" >&2
  exit 1
fi

# --- Determine repo root ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TOOLS_DIR="$REPO_ROOT/tools"
WORKSHOPS_DIR="$REPO_ROOT/workshops"
REGISTRY_FILE="$TOOLS_DIR/registry.json"

SLUG_PATTERN='^[a-z0-9][a-z0-9-]*$'

# --- Helper: validate slug ---
validate_slug() {
  local slug="$1"
  # Reject path traversal characters
  if [[ "$slug" == *".."* ]] || [[ "$slug" == *"/"* ]] || [[ "$slug" == *"\\"* ]]; then
    echo "WARNING: Rejecting slug '$slug' — contains path traversal characters" >&2
    return 1
  fi
  # Validate pattern
  if ! [[ "$slug" =~ $SLUG_PATTERN ]]; then
    echo "WARNING: Rejecting slug '$slug' — does not match pattern $SLUG_PATTERN" >&2
    return 1
  fi
  return 0
}

# --- Helper: validate path stays within repo ---
validate_path() {
  local dir_path="$1"
  local resolved
  resolved="$(realpath "$dir_path" 2>/dev/null)" || return 1
  if [[ "$resolved" != "$REPO_ROOT" && "$resolved" != "$REPO_ROOT/"* ]]; then
    echo "WARNING: Rejecting '$dir_path' — resolved path escapes repository root" >&2
    return 1
  fi
  return 0
}

# --- Collect tools ---
tools_json="[]"
if [ -d "$TOOLS_DIR" ]; then
  for dir in "$TOOLS_DIR"/*/; do
    [ -d "$dir" ] || continue
    slug="$(basename "$dir")"

    # Skip hidden directories
    [[ "$slug" == .* ]] && continue

    # Validate slug
    validate_slug "$slug" || continue

    # Validate path
    validate_path "$dir" || continue

    # Check for tool.json
    manifest="$dir/tool.json"
    if [ ! -f "$manifest" ]; then
      echo "WARNING: Skipping '$slug' — no tool.json found" >&2
      continue
    fi

    tools_json=$(echo "$tools_json" | jq --arg slug "$slug" \
      --arg path "tools/$slug" \
      --arg manifest "tools/$slug/tool.json" \
      '. + [{"slug": $slug, "path": $path, "manifest": $manifest}]')
  done
fi

# --- Collect workshops ---
workshops_json="[]"
if [ -d "$WORKSHOPS_DIR" ]; then
  for dir in "$WORKSHOPS_DIR"/*/; do
    [ -d "$dir" ] || continue
    slug="$(basename "$dir")"

    # Skip hidden directories
    [[ "$slug" == .* ]] && continue

    # Validate slug
    validate_slug "$slug" || continue

    # Validate path
    validate_path "$dir" || continue

    # Check for workshop.json
    manifest="$dir/workshop.json"
    if [ ! -f "$manifest" ]; then
      echo "WARNING: Skipping '$slug' — no workshop.json found" >&2
      continue
    fi

    workshops_json=$(echo "$workshops_json" | jq --arg slug "$slug" \
      --arg path "workshops/$slug" \
      --arg manifest "workshops/$slug/workshop.json" \
      '. + [{"slug": $slug, "path": $path, "manifest": $manifest}]')
  done
fi

# --- Generate registry ---
generated_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

registry=$(jq -n \
  --arg version "1.0.0" \
  --arg generatedAt "$generated_at" \
  --argjson tools "$tools_json" \
  --argjson workshops "$workshops_json" \
  '{version: $version, generatedAt: $generatedAt, tools: $tools, workshops: $workshops}')

echo "$registry" | jq '.' > "$REGISTRY_FILE"
echo "Registry generated at $REGISTRY_FILE with $(echo "$tools_json" | jq length) tool(s) and $(echo "$workshops_json" | jq length) workshop(s)."

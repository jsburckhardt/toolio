#!/usr/bin/env bash
# scripts/__tests__/test-rebuild-registry.sh
# Tests for scripts/rebuild-registry.sh
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REBUILD_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)/rebuild-registry.sh"

PASSED=0
FAILED=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

pass() {
  echo -e "  ${GREEN}PASS${NC}: $1"
  ((PASSED++))
}

fail() {
  echo -e "  ${RED}FAIL${NC}: $1 — $2"
  ((FAILED++))
}

# Create a temporary test environment
setup_temp_repo() {
  local tmp_dir
  tmp_dir=$(mktemp -d)
  mkdir -p "$tmp_dir/tools" "$tmp_dir/workshops" "$tmp_dir/schemas" "$tmp_dir/scripts"
  cp "$REBUILD_SCRIPT" "$tmp_dir/scripts/rebuild-registry.sh"
  echo "$tmp_dir"
}

cleanup() {
  local dir="$1"
  rm -rf "$dir"
}

echo "=== Test: Normal run with valid tools ==="
TMPDIR=$(setup_temp_repo)
mkdir -p "$TMPDIR/tools/my-tool"
cat > "$TMPDIR/tools/my-tool/tool.json" <<'EOF'
{"name":"my-tool","version":"1.0.0"}
EOF
mkdir -p "$TMPDIR/workshops/my-workshop"
cat > "$TMPDIR/workshops/my-workshop/workshop.json" <<'EOF'
{"name":"my-workshop","version":"1.0.0"}
EOF
output=$(cd "$TMPDIR" && bash scripts/rebuild-registry.sh 2>&1)
if [ -f "$TMPDIR/tools/registry.json" ] && \
   jq -e '.tools | length == 1' "$TMPDIR/tools/registry.json" &>/dev/null && \
   jq -e '.workshops | length == 1' "$TMPDIR/tools/registry.json" &>/dev/null && \
   jq -e '.tools[0].slug == "my-tool"' "$TMPDIR/tools/registry.json" &>/dev/null && \
   jq -e '.workshops[0].slug == "my-workshop"' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Normal run produces correct registry"
else
  fail "Normal run" "registry.json content incorrect"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Empty tools directory ==="
TMPDIR=$(setup_temp_repo)
mkdir -p "$TMPDIR/workshops/my-workshop"
cat > "$TMPDIR/workshops/my-workshop/workshop.json" <<'EOF'
{"name":"my-workshop","version":"1.0.0"}
EOF
cd "$TMPDIR" && bash scripts/rebuild-registry.sh &>/dev/null
if jq -e '.tools | length == 0' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Empty tools directory produces empty tools array"
else
  fail "Empty tools" "tools array not empty"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Empty workshops directory ==="
TMPDIR=$(setup_temp_repo)
mkdir -p "$TMPDIR/tools/my-tool"
cat > "$TMPDIR/tools/my-tool/tool.json" <<'EOF'
{"name":"my-tool","version":"1.0.0"}
EOF
cd "$TMPDIR" && bash scripts/rebuild-registry.sh &>/dev/null
if jq -e '.workshops | length == 0' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Empty workshops directory produces empty workshops array"
else
  fail "Empty workshops" "workshops array not empty"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Directory without manifest is skipped ==="
TMPDIR=$(setup_temp_repo)
mkdir -p "$TMPDIR/tools/no-manifest"
echo "# Just a readme" > "$TMPDIR/tools/no-manifest/README.md"
stderr_output=$(cd "$TMPDIR" && bash scripts/rebuild-registry.sh 2>&1 >/dev/null || true)
if echo "$stderr_output" | grep -q "no-manifest"; then
  pass "Directory without manifest emits warning"
else
  fail "No manifest warning" "no warning about no-manifest directory"
fi
if [ -f "$TMPDIR/tools/registry.json" ] && ! jq -e '.tools[] | select(.slug == "no-manifest")' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Directory without manifest not in registry"
else
  fail "No manifest skip" "no-manifest appeared in registry"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Slug with path traversal is rejected ==="
TMPDIR=$(setup_temp_repo)
# We can't create a directory literally named ".." but we can test the script's slug validation
# by creating a directory with dots in the name that triggers the check
mkdir -p "$TMPDIR/tools/evil..tool"
cat > "$TMPDIR/tools/evil..tool/tool.json" <<'EOF'
{"name":"evil..tool","version":"1.0.0"}
EOF
stderr_output=$(cd "$TMPDIR" && bash scripts/rebuild-registry.sh 2>&1 >/dev/null || true)
if echo "$stderr_output" | grep -qi "reject\|traversal\|path"; then
  pass "Path traversal slug rejected"
else
  fail "Path traversal" "no rejection message for slug with .."
fi
if [ -f "$TMPDIR/tools/registry.json" ] && ! jq -e '.tools[] | select(.slug == "evil..tool")' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Path traversal slug not in registry"
else
  fail "Path traversal registry" "evil..tool appeared in registry"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Symlink escaping repo root is rejected ==="
TMPDIR=$(setup_temp_repo)
# Create an external directory
EXT_DIR=$(mktemp -d)
cat > "$EXT_DIR/tool.json" <<'EOF'
{"name":"evil-link","version":"1.0.0"}
EOF
ln -s "$EXT_DIR" "$TMPDIR/tools/evil-link"
stderr_output=$(cd "$TMPDIR" && bash scripts/rebuild-registry.sh 2>&1 >/dev/null || true)
if echo "$stderr_output" | grep -qi "reject\|escape\|root"; then
  pass "Symlink escape rejected"
else
  fail "Symlink escape" "no rejection for symlink outside repo"
fi
if [ -f "$TMPDIR/tools/registry.json" ] && ! jq -e '.tools[] | select(.slug == "evil-link")' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Symlink escape not in registry"
else
  fail "Symlink registry" "evil-link appeared in registry"
fi
rm -rf "$EXT_DIR"
cleanup "$TMPDIR"

echo ""
echo "=== Test: Symlink prefix collision (repo-evil) is rejected ==="
TMPDIR=$(setup_temp_repo)
# Create an external directory whose path starts with REPO_ROOT but is not inside it
EVIL_DIR="${TMPDIR}-evil"
mkdir -p "$EVIL_DIR"
cat > "$EVIL_DIR/tool.json" <<'EOF'
{"name":"prefix-evil","displayName":"Prefix Evil","version":"1.0.0","description":"test","author":"test","license":"MIT","type":"script","tags":["test"],"entrypoint":"run.sh"}
EOF
ln -s "$EVIL_DIR" "$TMPDIR/tools/prefix-evil"
stderr_output=$(cd "$TMPDIR" && bash scripts/rebuild-registry.sh 2>&1 >/dev/null || true)
if echo "$stderr_output" | grep -qi "reject\|escape\|root"; then
  pass "Prefix collision symlink rejected"
else
  fail "Prefix collision" "no rejection for symlink to ${TMPDIR}-evil"
fi
if [ -f "$TMPDIR/tools/registry.json" ] && ! jq -e '.tools[] | select(.slug == "prefix-evil")' "$TMPDIR/tools/registry.json" &>/dev/null; then
  pass "Prefix collision not in registry"
else
  fail "Prefix collision registry" "prefix-evil appeared in registry"
fi
rm -rf "$EVIL_DIR"
cleanup "$TMPDIR"

echo ""
echo "=== Test: Missing jq produces error ==="
TMPDIR=$(setup_temp_repo)
# Create a minimal bin dir with essential tools but NOT jq
mkdir -p "$TMPDIR/fake_bin"
for cmd in bash cat echo date dirname pwd realpath basename; do
  real_path="$(command -v "$cmd" 2>/dev/null || true)"
  if [ -n "$real_path" ]; then
    ln -sf "$real_path" "$TMPDIR/fake_bin/$cmd"
  fi
done
exit_code=0
output=$(cd "$TMPDIR" && env PATH="$TMPDIR/fake_bin" bash scripts/rebuild-registry.sh 2>&1) || exit_code=$?
if [ "$exit_code" -ne 0 ] && echo "$output" | grep -qi "jq"; then
  pass "Missing jq produces error"
else
  fail "Missing jq" "no error about jq (exit=$exit_code)"
fi
cleanup "$TMPDIR"

echo ""
echo "=== Test: Script is idempotent ==="
TMPDIR=$(setup_temp_repo)
mkdir -p "$TMPDIR/tools/my-tool"
cat > "$TMPDIR/tools/my-tool/tool.json" <<'EOF'
{"name":"my-tool","version":"1.0.0"}
EOF
cd "$TMPDIR" && bash scripts/rebuild-registry.sh &>/dev/null
# Remove timestamp for comparison
first_run=$(jq 'del(.generatedAt)' "$TMPDIR/tools/registry.json")
cd "$TMPDIR" && bash scripts/rebuild-registry.sh &>/dev/null
second_run=$(jq 'del(.generatedAt)' "$TMPDIR/tools/registry.json")
if [ "$first_run" = "$second_run" ]; then
  pass "Script is idempotent (excluding timestamp)"
else
  fail "Idempotency" "outputs differ between runs"
fi
cleanup "$TMPDIR"

echo ""
echo "==============================="
echo "Results: $PASSED passed, $FAILED failed"
echo "==============================="

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

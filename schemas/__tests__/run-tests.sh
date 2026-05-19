#!/usr/bin/env bash
# schemas/__tests__/run-tests.sh
# Runs schema validation tests against all fixtures.
# Requires: check-jsonschema
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMAS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

TOOL_SCHEMA="$SCHEMAS_DIR/tool.schema.json"
WORKSHOP_SCHEMA="$SCHEMAS_DIR/workshop.schema.json"

PASSED=0
FAILED=0

# Helper: expect validation to pass
expect_pass() {
  local schema="$1" fixture="$2" label="$3"
  if check-jsonschema --schemafile "$schema" "$fixture" &>/dev/null; then
    echo "  PASS: $label"
    ((PASSED++))
  else
    echo "  FAIL: $label (expected pass, got fail)"
    ((FAILED++))
  fi
}

# Helper: expect validation to fail
expect_fail() {
  local schema="$1" fixture="$2" label="$3"
  if check-jsonschema --schemafile "$schema" "$fixture" &>/dev/null; then
    echo "  FAIL: $label (expected fail, got pass)"
    ((FAILED++))
  else
    echo "  PASS: $label"
    ((PASSED++))
  fi
}

echo "=== Tool Schema Tests ==="
expect_pass "$TOOL_SCHEMA" "$SCRIPT_DIR/valid-tool.json" "valid-tool.json passes"
expect_fail "$TOOL_SCHEMA" "$SCRIPT_DIR/invalid-tool-missing-field.json" "invalid-tool-missing-field.json fails"
expect_fail "$TOOL_SCHEMA" "$SCRIPT_DIR/invalid-tool-bad-type.json" "invalid-tool-bad-type.json fails"
expect_fail "$TOOL_SCHEMA" "$SCRIPT_DIR/invalid-tool-bad-slug.json" "invalid-tool-bad-slug.json fails"

echo ""
echo "=== Workshop Schema Tests ==="
expect_pass "$WORKSHOP_SCHEMA" "$SCRIPT_DIR/valid-workshop.json" "valid-workshop.json passes"
expect_fail "$WORKSHOP_SCHEMA" "$SCRIPT_DIR/invalid-workshop-missing-field.json" "invalid-workshop-missing-field.json fails"
expect_fail "$WORKSHOP_SCHEMA" "$SCRIPT_DIR/invalid-workshop-bad-difficulty.json" "invalid-workshop-bad-difficulty.json fails"

echo ""
echo "=== Results: $PASSED passed, $FAILED failed ==="

if [ "$FAILED" -gt 0 ]; then
  exit 1
fi

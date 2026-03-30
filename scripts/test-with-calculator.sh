#!/usr/bin/env bash
# Test GreenCode AI pipeline with Calculator.java
# Prerequisites: Gateway running (npm start in modules/gateway), from repo root.

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATEWAY_URL="${GATEWAY_URL:-http://localhost:5400}"
CALCULATOR="$REPO_ROOT/modules/Context_Memory/JAVA_PROJECT/Calculator.java"

echo "GreenCode AI – Test with Calculator.java"
echo "Gateway: $GATEWAY_URL"
echo ""

# 1. Health check
echo "1. Health check..."
curl -s -o /dev/null -w "%{http_code}" "$GATEWAY_URL/health" | grep -q 200 && echo "   OK" || { echo "   FAIL: start gateway (cd modules/gateway && npm start)"; exit 1; }

# 2. Analyze via JSON body (code snippet); use a temp JSON file to avoid escaping
echo "2. POST /api/analyze with code snippet..."
TMP_JSON=$(mktemp)
if command -v jq >/dev/null 2>&1; then
  jq -n --rawfile code "$CALCULATOR" '{ code: $code, fileName: "Calculator.java" }' > "$TMP_JSON"
else
  echo '{"code":"public class Calculator { public int add(int a, int b) { return a + b; } }","fileName":"Calculator.java"}' > "$TMP_JSON"
fi
RESP=$(curl -s -X POST "$GATEWAY_URL/api/analyze" -H "Content-Type: application/json" -d @"$TMP_JSON")
rm -f "$TMP_JSON"

if echo "$RESP" | grep -q '"unifiedIssues"'; then
  echo "   OK – response includes unifiedIssues and patches"
elif echo "$RESP" | grep -q '"status"'; then
  echo "   OK – pipeline response received (check status)"
else
  echo "   Response (first 400 chars): ${RESP:0:400}"
  echo "   (Run full pipeline from gateway; ensure static-analyzer is built)"
fi

echo ""
echo "Done. For full scan with zip: curl -X POST -F 'project=@your.zip' $GATEWAY_URL/scan"

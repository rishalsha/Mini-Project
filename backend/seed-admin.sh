#!/usr/bin/env bash
set -euo pipefail

# Edit these values, then run: ./seed-admin.sh
API_BASE_URL="http://localhost:8080"
ADMIN_NAME="Admin"
ADMIN_EMAIL="rishal.p786@gmail.com"
ADMIN_PASSWORD="Rishalsh@786"

if [[ -z "$ADMIN_NAME" || -z "$ADMIN_EMAIL" || -z "$ADMIN_PASSWORD" ]]; then
  echo "[ERROR] ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set."
  exit 1
fi

# Basic password policy check to match backend validation
if [[ ${#ADMIN_PASSWORD} -lt 8 || ${#ADMIN_PASSWORD} -gt 64 ]]; then
  echo "[ERROR] Password must be 8-64 characters."
  exit 1
fi

if [[ ! "$ADMIN_PASSWORD" =~ [a-z] || ! "$ADMIN_PASSWORD" =~ [A-Z] || ! "$ADMIN_PASSWORD" =~ [0-9] || ! "$ADMIN_PASSWORD" =~ [^A-Za-z0-9] || "$ADMIN_PASSWORD" =~ [[:space:]] ]]; then
  echo "[ERROR] Password must include uppercase, lowercase, number, special character, and no spaces."
  exit 1
fi

HEALTH_URL="$API_BASE_URL/api/resume/health"
REGISTER_URL="$API_BASE_URL/api/admin/auth/register"

health_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || true)
if [[ "$health_code" != "200" ]]; then
  echo "[ERROR] Backend is not reachable at $API_BASE_URL"
  echo "        Start backend first: cd backend && mvn spring-boot:run"
  exit 1
fi

payload=$(cat <<JSON
{
  "name": "$ADMIN_NAME",
  "email": "$ADMIN_EMAIL",
  "password": "$ADMIN_PASSWORD"
}
JSON
)

tmp_body=$(mktemp)
http_code=$(curl -s -o "$tmp_body" -w "%{http_code}" \
  -X POST "$REGISTER_URL" \
  -H "Content-Type: application/json" \
  -d "$payload")

if [[ "$http_code" == "200" || "$http_code" == "201" ]]; then
  echo "[OK] Admin seeded successfully."
  cat "$tmp_body"
  rm -f "$tmp_body"
  exit 0
fi

if [[ "$http_code" == "409" ]]; then
  echo "[INFO] Admin email already exists: $ADMIN_EMAIL"
  cat "$tmp_body"
  rm -f "$tmp_body"
  exit 0
fi

echo "[ERROR] Failed to seed admin (HTTP $http_code)"
cat "$tmp_body"
rm -f "$tmp_body"
exit 1

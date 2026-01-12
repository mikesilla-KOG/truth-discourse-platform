#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3333}

# call demo seed
echo "Calling demo seed at $BASE_URL/demo/seed"
resp=$(curl -s -X POST "$BASE_URL/demo/seed")
if [[ "$resp" != *ok* ]]; then
  echo "Seed failed: $resp"
  exit 2
fi

echo "Seed endpoint returned OK"

# fetch groups
groups=$(curl -s "$BASE_URL/groups")
echo "Groups: $groups"
count=$(echo "$groups" | jq '. | length')
if [ "$count" -lt 3 ]; then
  echo "Expected at least 3 groups, got $count"
  exit 3
fi

echo "Smoke seed successful: $count groups present"

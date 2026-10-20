#!/usr/bin/env sh
# Runs the checks from .github/workflows/ci.yml, minus install.
# Usage: ./scripts/check.sh [--full]
#   default  pnpm lint, pnpm typecheck, pnpm test
#   --full   also pnpm build, which regenerates registry.json and apps/docs/public/r
set -u

cd "$(dirname "$0")/.." || exit 1

full=0
case "${1:-}" in
  "") ;;
  --full) full=1 ;;
  *)
    echo "usage: $0 [--full]" >&2
    exit 2
    ;;
esac

failed=""

run() {
  name=$1
  shift
  echo "==> $name: $*"
  if "$@"; then
    echo "<== $name: ok"
  else
    echo "<== $name: FAILED"
    failed="$failed $name"
  fi
}

run lint pnpm lint
run typecheck pnpm typecheck
run test pnpm test

if [ "$full" -eq 1 ]; then
  run build pnpm build
  changed=$(git status --porcelain -- registry.json apps/docs/public/r)
  if [ -n "$changed" ]; then
    # Expected after a catalog or source change; CI fails if these are not committed.
    echo "Generated registry files differ from the index. Commit them with the source change:"
    echo "$changed"
  fi
fi

if [ -n "$failed" ]; then
  echo "Failed:$failed"
  exit 1
fi

echo "All checks passed."

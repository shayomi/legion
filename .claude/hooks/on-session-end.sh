#!/bin/bash
# Legion — auto daily report + Obsidian sync on session end
# Paths resolve relative to this repo. Personal settings (e.g. OBSIDIAN_VAULT)
# live in a gitignored .env at the Legion root — see .env.example.
LEGION_ROOT="${LEGION_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
export LEGION_ROOT
[ -f "$LEGION_ROOT/.env" ] && set -a && . "$LEGION_ROOT/.env" && set +a

TSX="$LEGION_ROOT/node_modules/.bin/tsx"
MEMORY="$LEGION_ROOT/src/scripts/memory-agent.ts"

"$TSX" "$MEMORY" daily 2>/dev/null || true
"$TSX" "$MEMORY" sync 2>/dev/null || true

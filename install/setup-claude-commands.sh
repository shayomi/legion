#!/bin/bash
# Legion — Claude Code Global Commands Installer

set -e

LEGION_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_GLOBAL_DIR="$HOME/.claude/commands"

echo ""
echo "╔══════════════════════════════════════╗"
echo "║  Legion — Claude Code Setup          ║"
echo "╚══════════════════════════════════════╝"
echo ""

mkdir -p "$CLAUDE_GLOBAL_DIR"

for cmd_file in "$LEGION_DIR/.claude/commands/"*.md; do
  filename=$(basename "$cmd_file")
  [ "$filename" = "README.md" ] && continue
  dest="$CLAUDE_GLOBAL_DIR/$filename"
  cp "$cmd_file" "$dest"
  echo "  ✓ /$( echo "$filename" | sed 's/\.md$//')"
done

echo ""
echo "  Legion system commands:"
echo "  /legion-scan        /legion-brief       /legion-standup"
echo "  /legion-brainstorm  /legion-spec        /legion-review"
echo "  /legion-log         /legion-daily"
echo ""
echo "  Agent commands (17 agents):"
echo "  /legion-titan       /legion-prism       /legion-forge"
echo "  /legion-stratus     /legion-conduit     /legion-cipher"
echo "  /legion-aegis       /legion-probe       /legion-lens"
echo "  /legion-nexus       /legion-compass     /legion-blueprint"
echo "  /legion-shield      /legion-orbit       /legion-oracle"
echo "  /legion-signal      /legion-memory"
echo ""
echo "  Open Claude Code in any project and type /legion to see them."
echo ""
echo "  I am Legion. We are many."
echo ""

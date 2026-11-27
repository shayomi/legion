# Legion — Quick Start

## 1. Install dependencies
```bash
cd legion
npm install
```

## 2. Run immediately (no build needed)
```bash
# Show all commands
npx tsx src/scripts/legion.ts

# List all 17 agents
npx tsx src/scripts/legion.ts agents

# Check system status
npx tsx src/scripts/legion.ts status

# Scan an existing project (run from that project's root)
cd /your/project
npx tsx /path/to/legion/src/scripts/scan.ts

# Run a brainstorm
npx tsx /path/to/legion/src/scripts/brainstorm.ts "Your feature here"

# Memory operations
npx tsx /path/to/legion/src/scripts/memory-agent.ts status
npx tsx /path/to/legion/src/scripts/memory-agent.ts sync
npx tsx /path/to/legion/src/scripts/memory-agent.ts log "Today I started Legion"
```

## 3. Or use npm scripts (from legion/ root)
```bash
npm run dev              # legion.ts — shows help
npm run scan             # scan current directory
npm run brainstorm "..."
npm run memory status
npm run memory sync
npm run daily
npm run sync
```

## 4. Type check
```bash
npm run typecheck
```

## 5. Build to dist/ (for production use)
```bash
npm run build
node dist/scripts/legion.js
```

## 6. Obsidian setup (optional but recommended)
```bash
export OBSIDIAN_VAULT=/Users/yourname/YourObsidianVault
npm run sync
```

## 7. Notion setup (optional)
```bash
export NOTION_TOKEN=secret_xxxxxxxxxxxxxxxx
export NOTION_DB_ID=your-database-id
npm run sync
```

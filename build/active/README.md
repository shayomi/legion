# Active Builds

Features currently in development live here.

Each feature gets its own folder:
```
active/
└── feature-name/
    ├── tasks.json          ← Task list (moved from backlog)
    ├── notes.md            ← Working notes, decisions, blockers
    └── handoffs.md         ← What each agent hands off to the next
```

## Updating task status

Edit `tasks.json` directly, or log progress:
```bash
legion memory log "FORGE: Completed T008 — API endpoints built and tested"
```

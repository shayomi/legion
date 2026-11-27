# Error Log

System errors, failed operations, and unexpected states.

When a script fails, when a sync fails, when an agent cannot complete a task —
it gets logged here so nothing is silently lost.

Format: `YYYY-MM-DD-errors.jsonl`

```json
{"ts":"2026-04-12T10:00:00Z","type":"SYNC_FAILED","detail":"Obsidian vault not found at /Users/you/Vault","resolution":"Set OBSIDIAN_VAULT environment variable"}
```

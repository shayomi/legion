# Audit Log

Immutable record of all significant actions in Legion.

Every BLOCK event, every release sign-off, every override of an agent veto,
every contract review — logged here with timestamp, agent, and rationale.

Format: `YYYY-MM-DD-audit.jsonl` (one JSON object per line)

```json
{"ts":"2026-04-12T10:00:00Z","type":"RELEASE_SIGNOFF","agent":"CIPHER","project":"project-name","detail":"Security audit passed. No critical findings."}
{"ts":"2026-04-12T10:05:00Z","type":"BLOCK","agent":"CIPHER","project":"project-name","severity":"critical","detail":"Hardcoded API key in config.js line 42"}
{"ts":"2026-04-12T10:30:00Z","type":"BLOCK_OVERRIDE","agent":"TITAN","override_of":"CIPHER","rationale":"Key is test-only, not production. Accepted risk. Will rotate."}
```

# Events

The Legion event bus. All inter-agent communication is logged here as LIAP events.

## Format

`YYYY-MM-DD-events.jsonl` — one JSON event envelope per line (see core/protocols/liap.md)

## Reading the event log

```bash
# View today's events
cat core/events/$(date +%Y-%m-%d)-events.jsonl | python3 -m json.tool

# Count events by type
grep -o '"type":"[^"]*"' core/events/*.jsonl | sort | uniq -c | sort -rn
```

## Event retention

Events are kept for 90 days by default.
Significant events (BLOCKs, overrides, release sign-offs) are also copied to `logs/audit/`.

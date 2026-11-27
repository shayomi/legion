# Vector Store — Local Search Index

Legion's local keyword search index. No external services required.

The `index.json` file is built and maintained by the MEMORY agent.
Every time a new note, spec, log, or report is created, it gets indexed here.

## Search

```bash
legion memory recall "authentication patterns"
legion memory recall "postgres performance"
legion memory recall "client onboarding"
```

## Index structure

```json
{
  "version": "1.0",
  "entries": [
    {
      "id": "unique-id",
      "type": "spec | daily-log | decision | note | brief",
      "title": "Document title",
      "content_preview": "First 200 characters...",
      "keywords": ["extracted", "keywords", "from", "content"],
      "tags": ["manual", "tags"],
      "indexed_at": "2026-04-12T10:00:00Z"
    }
  ]
}
```

## Upgrading

The current implementation is keyword-based (fast, zero dependencies).
When Legion is ready for semantic search, drop in an embedding model here —
the interface stays the same, the quality improves.

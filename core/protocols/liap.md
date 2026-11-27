# Legion Inter-Agent Protocol (LIAP) v1.0

## Overview
All agents in Legion communicate through a structured event protocol.
Every message, delegation, escalation and report follows this format.
Nothing is informal. Everything is logged.

---

## Message Envelope

```json
{
  "id": "evt_<timestamp>_<random>",
  "type": "<event_type>",
  "from": "<agent_codename>",
  "to": "<agent_codename | broadcast | legion>",
  "priority": "low | normal | high | critical",
  "timestamp": "<ISO8601>",
  "session": "<session_id>",
  "project": "<project_id | null>",
  "payload": {},
  "requires_ack": true,
  "ttl_hours": 24
}
```

---

## Event Types

### `TASK_ASSIGN`
One agent delegates a task to another.
```json
{
  "type": "TASK_ASSIGN",
  "payload": {
    "task_id": "task_001",
    "title": "Audit auth endpoints for SQL injection",
    "description": "...",
    "context_refs": ["specs/tech/auth-v2.md", "build/active/auth-refactor"],
    "deadline": "2026-04-14T17:00:00Z",
    "deliverable": "Written report in specs/tech/"
  }
}
```

### `TASK_COMPLETE`
Agent reports task done.
```json
{
  "type": "TASK_COMPLETE",
  "payload": {
    "task_id": "task_001",
    "summary": "Found 2 potential SQLi vectors. Fixed. Details in report.",
    "output_refs": ["specs/tech/security-audit-auth-v2.md"],
    "time_spent_minutes": 45,
    "blockers_encountered": []
  }
}
```

### `BRAINSTORM_CALL`
Initiate a multi-agent brainstorm session.
```json
{
  "type": "BRAINSTORM_CALL",
  "payload": {
    "session_id": "bs_001",
    "topic": "Real-time collaboration feature",
    "context": "Client needs multi-user editing. Current stack: React + Node + Postgres.",
    "invited": ["cto","frontend","backend","cloud","product-manager"],
    "format": "round-table | structured | silent-then-discuss",
    "output_target": "brainstorm/sessions/collab-feature-bs_001.md"
  }
}
```

### `SPEC_REQUEST`
Request a specification document from the relevant agent.
```json
{
  "type": "SPEC_REQUEST",
  "payload": {
    "spec_type": "prd | tech | architecture | test-plan | proposal",
    "feature": "Real-time collaboration",
    "requestor": "product-manager",
    "assignee": "solutions-architect",
    "context_refs": ["brainstorm/sessions/collab-feature-bs_001.md"],
    "output_target": "specs/prd/collab-feature-v1.md"
  }
}
```

### `REVIEW_REQUEST`
Request a formal review.
```json
{
  "type": "REVIEW_REQUEST",
  "payload": {
    "review_type": "code | architecture | security | spec | design",
    "artifact_refs": ["build/active/auth-refactor/"],
    "assignee": "reviewer",
    "blocking": true,
    "checklist": ["SOLID", "test-coverage>80%", "no-secrets-in-code"]
  }
}
```

### `BLOCK`
An agent is blocking progress — must be resolved before proceeding.
```json
{
  "type": "BLOCK",
  "payload": {
    "blocker_agent": "cyber",
    "blocking_what": "build/active/auth-refactor",
    "reason": "JWT secret stored in env file committed to repo",
    "severity": "critical",
    "resolution_required": "Move to secrets manager. Re-audit before merge.",
    "escalate_to": "cto"
  }
}
```

### `LEARN`
Agent acquires a new skill and registers it.
```json
{
  "type": "LEARN",
  "payload": {
    "agent": "backend",
    "skill_name": "temporal-workflows",
    "skill_source": "project-learnt | skills.sh | external-doc | user-taught",
    "description": "Learned Temporal.io workflow orchestration from the payments project",
    "confidence": 0.85,
    "registered_at": "core/skills/temporal-workflows.md"
  }
}
```

### `MEMORY_SYNC`
Knowledge agent syncing state across memory stores.
```json
{
  "type": "MEMORY_SYNC",
  "payload": {
    "sync_direction": "legion-to-obsidian | obsidian-to-legion | bidirectional",
    "scope": "daily-log | project | full",
    "obsidian_vault_path": "/Users/you/ObsidianVault/Legion",
    "notion_database_id": "optional",
    "items_synced": 0
  }
}
```

### `DAILY_REPORT`
Every agent files this at end of session.
```json
{
  "type": "DAILY_REPORT",
  "payload": {
    "agent": "backend",
    "date": "2026-04-12",
    "completed": [],
    "in_progress": [],
    "blocked": [],
    "learned": [],
    "flags": [],
    "tomorrow": []
  }
}
```

---

## Priority Rules

| Priority | SLA | Example |
|---|---|---|
| `critical` | Immediate | Security breach, prod down, data loss |
| `high` | < 1 session | Blocker on active build, client deadline |
| `normal` | Next session | Standard tasks, spec requests |
| `low` | Backlog | Research, non-blocking improvements |

---

## Escalation Chain

```
tester → qa → reviewer → cto → legion
frontend/backend/cloud/devops → cto → legion
cyber/legal-compliance → legion (direct)
intel/analyst/product-manager → legion (direct)
knowledge → all agents (broadcast rights)
```

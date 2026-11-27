# Build Backlog

All feature task lists live here before they move to `active/`.

Generated automatically by `legion brainstorm`. Each file is a JSON task list
with dependency mapping — every task knows what it depends on.

## Workflow

```
backlog/ → active/ → completed/
```

Move a feature folder to `active/` when the sprint begins.
Move it to `completed/` when the feature ships.

## Task status values

`open` | `in-progress` | `blocked` | `in-review` | `done`

## Picking up a task

1. Find it in the JSON task list
2. Check `depends_on` — all dependencies must be `done` first
3. Set status to `in-progress`
4. Log start in `legion memory log "Starting T00X: [task title]"`
5. On completion, set to `done` and log it

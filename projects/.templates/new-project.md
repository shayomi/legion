# New Project Setup Checklist

Use this when Legion takes on a new project.

## 1. Scan (if existing codebase)
```bash
cd /path/to/project
legion scan
```

## 2. Create client entry (if client project)
```
clients/.vault/client-name/profile.json
```

## 3. Brief ORACLE
Have ORACLE research the client, market, and competitive landscape.

## 4. Brief COMPASS
COMPASS interviews stakeholders and drafts the initial product vision.

## 5. Run brainstorm for first major feature
```bash
legion brainstorm "First major feature or milestone"
```

## 6. SHIELD reviews contracts
Ensure NDAs, MSAs, and data processing agreements are in place before work begins.

## 7. STRATUS plans infrastructure
Even before code is written, know what the infrastructure will look like.

## 8. Set up memory
```bash
legion memory note "Project: [Project Name]"
legion memory sync
```

## 9. First sprint planning
ORBIT runs sprint planning. Backlog from brainstorm is the starting point.

## 10. Daily cadence
```bash
# Start of session
legion memory log "Session start — working on [project]"

# End of session
legion memory daily
legion memory sync
```

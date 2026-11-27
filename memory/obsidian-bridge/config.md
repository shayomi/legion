# Obsidian Bridge Configuration

The MEMORY agent uses this folder to manage its Obsidian connection.

## Setup

```bash
# Set your vault path (add to your shell profile)
export OBSIDIAN_VAULT=/Users/yourname/YourObsidianVault

# Run initial sync — creates /Legion/ folder structure in your vault
legion memory sync
```

## What Legion creates in your vault

```
YourVault/
└── Legion/
    ├── Daily Notes/        ← All daily logs (synced each session)
    ├── Projects/           ← One note per project
    ├── Agents/             ← Agent reports
    ├── Decisions/          ← ADRs and key decisions
    ├── Brainstorms/        ← Session documents
    ├── Clients/            ← Client profiles
    ├── Specs/              ← PRDs, tech specs
    ├── Intel/              ← ORACLE research briefs
    └── Skills/             ← Skill registry
```

## Obsidian plugins recommended

- **Dataview** — query Legion notes as a database
- **Templater** — use Legion note templates
- **Graph view** — see how Legion knowledge connects
- **Daily Notes** — integrates with Legion daily logs
- **Kanban** — visualise build backlog (pull from Legion JSON)

## Dataview query examples

Show all active projects:
```dataview
TABLE status, started FROM "Legion/Projects" WHERE status = "Active"
```

Show all open decisions:
```dataview
LIST FROM "Legion/Decisions" WHERE status = "Proposed"
```

Show recent agent activity:
```dataview
TABLE agent, summary FROM "Legion/Agents" SORT date DESC LIMIT 10
```

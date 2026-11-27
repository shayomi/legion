# Client Vault

Each client gets their own folder here. This is private — not synced publicly.

## Structure

```
clients/.vault/
└── client-name/
    ├── profile.json        ← Client overview, contacts, context
    ├── contracts/          ← NDAs, MSAs, SOWs (filenames only — docs stored securely)
    ├── history.md          ← Engagement history, key moments, relationship notes
    ├── intel.md            ← ORACLE's research on this client
    └── deliverables/       ← Links to specs and builds for this client
```

## Client Profile Template

```json
{
  "name": "Client Name",
  "industry": "",
  "size": "startup | smb | enterprise",
  "primary_contact": {
    "name": "",
    "role": "",
    "email": ""
  },
  "technical_contact": {
    "name": "",
    "role": "",
    "email": ""
  },
  "tech_stack": [],
  "compliance_requirements": [],
  "engagement_start": "",
  "engagement_status": "prospect | active | completed | paused",
  "notes": ""
}
```

## Privacy note

Client folders should not contain actual contract documents — store those in a
secure document system (encrypted cloud storage, legal DMS). This vault stores
context, history, and reference — not sensitive originals.

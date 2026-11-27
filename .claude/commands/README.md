# Legion — Claude Code Commands

These slash commands are available inside Claude Code sessions.

## Install globally (works in every project)

```bash
bash /path/to/legion/install/setup-claude-commands.sh
```

This copies all commands to `~/.claude/commands/` so they appear in every Claude Code session.

## Commands

| Command | What it does |
|---|---|
| `/legion-scan` | Scans the project, briefs all agents, summarises priorities |
| `/legion-brief` | Loads Legion context — use at the start of every session |
| `/legion-brainstorm <feature>` | Full spec pipeline — brainstorm → PRD → tech spec → tasks |
| `/legion-spec <feature>` | Quick spec, filled in immediately, ready to build |
| `/legion-review [file/changes]` | LENS + CIPHER code review |
| `/legion-log <message>` | Log activity to Legion memory |
| `/legion-standup` | Morning briefing — yesterday, blockers, today's focus |
| `/legion-daily` | End-of-session wrap up, daily report, Obsidian sync |

## Recommended session flow

```
Start:  /legion-brief          ← load context
        /legion-standup        ← what to work on

Build:  /legion-brainstorm ... ← plan a feature
        /legion-spec ...       ← quick spec + build
        /legion-review         ← review before done

End:    /legion-log "what we did"
        /legion-daily          ← wrap up + sync
```

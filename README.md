<div align="center">

# ⚔️ Legion

### _I am Legion. We are many._

**A 17-agent AI engineering organisation that lives inside Claude Code.**
CTO, engineers, security, QA, product, legal, data, intel — each with a codename,
a domain, a skill set and a seat at the table. One command briefs them all.

[![CI](https://github.com/shayomi/legion/actions/workflows/ci.yml/badge.svg)](https://github.com/shayomi/legion/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built for Claude Code](https://img.shields.io/badge/built%20for-Claude%20Code-d97757.svg)](https://claude.com/claude-code)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Why Legion?

A single AI assistant answers questions. **Legion runs a company.**

When you build a feature, Legion doesn't just write code. It runs the process a
serious engineering org would: product writes the PRD, the CTO signs off on
architecture, security threat-models the design, engineers build it, the reviewer
blocks sloppy patterns, QA breaks it, and memory makes sure none of it is forgotten.

- 🧠 **17 specialised agents** with defined domains, skills and handoffs
- 🔎 **Drop-in project scanner** that detects your stack, flags security smells, and briefs every agent
- 📐 **Spec pipeline**: one prompt → brainstorm, PRD, tech spec, architecture, test plan, task backlog
- 🧩 **Learnable skills registry**: agents register new techniques as they meet them
- 🗂 **Second-brain memory**: daily logs, keyword recall, optional Obsidian + Notion sync
- ⚡ **27 Claude Code slash commands** (`/legion-brief`, `/legion-review`, `/legion-titan` …)

---

## The Team

| Codename | Role | Domain |
|---|---|---|
| **TITAN** | CTO | Strategy, architecture, final technical authority |
| **FORGE** | Backend | APIs, business logic, data, integrations |
| **PRISM** | Frontend | UI/UX, component systems, performance |
| **CIPHER** | Security | Threats, audits, compliance, incident response |
| **AEGIS** | QA | Test strategy, quality gates, automation |
| **LENS** | Reviewer | Standards, patterns, technical debt |
| **CONDUIT** | DevOps | CI/CD, deployment, monitoring |
| **STRATUS** | Cloud | Infrastructure, scalability, cost |
| **NEXUS** | Data | Pipelines, ETL, analytics, ML infra |
| **COMPASS** | Product | Roadmap, PRDs, prioritisation |
| **BLUEPRINT** | Solutions Architect | System design, proposals |
| **SHIELD** | Legal & Compliance | Contracts, GDPR, SOC 2 |
| **ORBIT** | Project Manager | Delivery, timelines, blockers |
| **ORACLE** | Intel | Market research, competitive analysis |
| **SIGNAL** | Analyst | Metrics, KPIs, dashboards |
| **PROBE** | Tester | Exploratory testing, edge cases |
| **MEMORY** | Knowledge | Second brain, recall, Obsidian/Notion |

Each agent is defined in [`agents/`](agents/) and registered in
[`core/registry/agents.json`](core/registry/agents.json). Agents talk to each other
through the [Legion Inter-Agent Protocol](core/protocols/liap.md).

---

## Quick Start

**Requirements:** Node.js ≥ 18 and [Claude Code](https://claude.com/claude-code).

```bash
git clone https://github.com/shayomi/legion.git
cd legion
npm install
cp .env.example .env          # optional: set OBSIDIAN_VAULT, NOTION_*
npm link                      # puts `legion` on your PATH
```

Install the slash commands into Claude Code (available in every project):

```bash
bash install/setup-claude-commands.sh
```

Then, in any project:

```text
/legion-brief                 load context, start every session here
/legion-scan                  scan the codebase and brief all 17 agents
/legion-brainstorm <feature>  full spec pipeline
/legion-review                LENS + CIPHER review of your changes
```

---

## CLI

```bash
legion scan                     # scan current project, brief all agents
legion brainstorm "<feature>"   # PRD + tech spec + architecture + test plan + backlog
legion agents                   # list all agents
legion status                   # system overview
legion memory log "<msg>"       # log to the daily journal
legion memory recall "<query>"  # keyword search across memory
legion memory daily             # generate today's report
legion memory sync              # sync to Obsidian / Notion
legion memory status            # memory health check
```

No global install? Everything also runs with `npx tsx src/scripts/legion.ts <command>`.

---

## The Build Loop

```text
BRAINSTORM → PRD → TECH SPEC → ARCHITECTURE → SECURITY REVIEW
     → BUILD → CODE REVIEW → QA → SECURITY AUDIT → COMPLIANCE
     → DEPLOY → MONITOR → MEMORY SYNC
```

Every feature goes through the same 13 gates, each owned by a named agent.
See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system design.

---

## Repository Layout

```text
agents/          one folder per agent: persona, skills, decision logs
core/
  protocols/     LIAP inter-agent protocol
  registry/      agent registry (agents.json)
  skills/        learnable skills registry + skill docs
.claude/
  commands/      the /legion-* slash commands
  hooks/         session hooks (activity log, daily report)
src/             TypeScript CLI: scanner, brainstorm, memory agent
specs/ brainstorm/ build/
                 generated work output (only examples are tracked)
memory/ logs/ clients/
                 your private operating data (gitignored, stays local)
```

> **Privacy by design.** Your memory, logs, client vault and generated specs are
> gitignored. Only the framework is shared, so you can contribute back without
> leaking your work.

---

## Contributing

Legion gets better every time someone teaches it something. The most valuable
contributions are usually **not code**:

- 🧩 **A new skill** in `core/skills/`: a technique you know well, written up for the agents
- 🤖 **Sharper agent definitions**: better heuristics, checklists, failure modes
- ⚡ **A new slash command** in `.claude/commands/`
- 🛠 **CLI improvements** in `src/`

Read **[CONTRIBUTING.md](CONTRIBUTING.md)** before opening a PR. All contributions
go through review, and `main` is protected.

---

## License

[MIT](LICENSE). Use it, fork it, build your own legion.

<div align="center"><sub><i>I am Legion. We are many.</i></sub></div>

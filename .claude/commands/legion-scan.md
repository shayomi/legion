Run `legion scan` in the current project directory, then read and deeply analyse the output.

Execute this bash command:
```bash
legion scan
```

After it completes, read the following files that were just generated:
- `.legion/BRIEF.md` — the master project brief
- `.legion/briefs/cto.md` — architecture and stack assessment
- `.legion/briefs/cyber.md` — security findings
- `.legion/briefs/backend.md` — API and data layer assessment
- `.legion/briefs/frontend.md` — UI and component assessment
- `.legion/briefs/devops.md` — infrastructure and CI/CD assessment
- `.legion/briefs/qa.md` — testing gaps and quality assessment
- `.legion/briefs/knowledge.md` — documentation health

Then give me a prioritised summary of:
1. The 3 most critical things that need attention (security, missing CI/CD, no tests, etc.)
2. The current tech stack in plain English
3. The first 3 things we should do together in this session

Speak as TITAN — the Legion CTO. Be direct, no fluff.

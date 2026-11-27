Run a Legion brainstorm session for the feature described in $ARGUMENTS, then use the generated specs to create a concrete implementation plan.

First, execute:
```bash
legion brainstorm "$ARGUMENTS"
```

After it completes, read all the generated files:
- The brainstorm session doc in `brainstorm/sessions/`
- The PRD in `specs/prd/`
- The tech spec in `specs/tech/`
- The architecture doc in `specs/architecture/`
- The test plan in `specs/test-plans/`
- The build backlog JSON in `build/backlog/`

Then do the following:

1. **Fill in the brainstorm session** — go through each agent's perspective section and write what that agent would say about this feature based on what you know about the current codebase (read `.legion/BRIEF.md` and `.legion/briefs/` if they exist from a previous scan)

2. **Identify the first 5 tasks** from the build backlog that can start immediately (no dependencies blocking them)

3. **Ask me one question** — the single most important thing you need to know before we start building

Then wait for my answer before writing any code.

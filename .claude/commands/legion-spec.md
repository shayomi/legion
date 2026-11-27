Generate a quick spec for $ARGUMENTS without a full brainstorm session. Use this when you know what to build and just need the spec documents created.

Execute:
```bash
legion brainstorm "$ARGUMENTS"
```

Then read the generated tech spec and PRD. Fill them in immediately based on:
- The current codebase (read `.legion/BRIEF.md` for context)
- What you know about best practices for this type of feature
- The existing patterns in this project

Do not leave `[ FILL IN ]` placeholders. Write real content.

Once filled in, write the updated content back to the spec files, then show me the tech spec and ask: "Ready to build. Should I start with the backend or frontend?"

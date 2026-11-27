Run a Legion code review on $ARGUMENTS (a file path, directory, or "all changes" for the full git diff).

First get the code to review:
```bash
# If $ARGUMENTS is a file or directory, read it
# If $ARGUMENTS is empty or "changes", run:
git diff HEAD
```

Then perform a full Legion review as two agents:

**LENS (Code Reviewer) checks:**
- Correctness — will this work for all cases including edge cases?
- Design — is this consistent with the existing architecture?
- SOLID principles — single responsibility, open/closed, etc.
- Error handling — are all failure modes handled?
- Readability — will the next engineer understand this immediately?
- Test coverage — is new logic tested?
- Dead code, unused imports, console.logs left in

**CIPHER (Security) checks:**
- Any hardcoded secrets, tokens, or credentials
- Input validation on all external data
- SQL injection, XSS, command injection vectors
- Auth checks on protected operations
- Sensitive data in logs

Format the output as:

## LENS Review
[findings with line references]

**Verdict:** APPROVED / CHANGES REQUIRED / BLOCKED

## CIPHER Review  
[security findings]

**Verdict:** APPROVED / CHANGES REQUIRED / BLOCKED

## Summary
[what to fix before this merges, in priority order]

If both approve, say: "LENS and CIPHER sign off. Ready to merge."

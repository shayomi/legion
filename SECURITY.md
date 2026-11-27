# Security Policy

## Reporting a vulnerability

**Please do not report security issues in public issues, discussions or PRs.**

Use GitHub's private vulnerability reporting:
👉 [Report a vulnerability](https://github.com/shayomi/legion/security/advisories/new)

Include:
- What the issue is and where (file, command, hook)
- Steps to reproduce
- The impact you believe it has

You'll get an acknowledgement within 7 days. Fixes are released on `main` and
credited in the advisory unless you'd rather stay anonymous.

## Scope

Legion runs locally and executes shell hooks inside Claude Code sessions.
Of particular interest:

- Hooks or slash commands that could run unintended commands
- The project scanner (`src/scripts/scan.ts`) reading or leaking files it shouldn't
- Anything that could cause personal memory, logs or client data to be committed or sent externally

## Supported versions

Only the latest commit on `main` is supported.

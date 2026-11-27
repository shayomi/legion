# Contributing to Legion

Thanks for helping Legion grow. Every skill, agent refinement and command you add
makes the whole organisation sharper for everyone who runs it.

## Ground rules

1. **Open an issue first** for anything beyond a typo or small fix. Agree on the
   approach before you write it. PRs without a linked issue may be closed.
2. **Never commit personal or client data.** Memory, logs, the client vault and
   generated specs are gitignored for a reason. No absolute paths
   (`/Users/you/...`), names, emails, tokens or real project details. CI checks this.
3. **One concern per PR.** A new skill and a CLI refactor are two PRs.
4. **Be kind.** We follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## What to contribute

| Type | Where | Notes |
|---|---|---|
| 🧩 New skill | `core/skills/<skill-name>.md` + entry in `core/skills/registry.json` | Use the template in [`core/skills/how-to-learn.md`](core/skills/how-to-learn.md) |
| 🤖 Agent improvement | `agents/<role>/<CODENAME>.md` | Keep the codename and domain; sharpen heuristics, checklists, failure modes |
| 🆕 New agent | `agents/`, `core/registry/agents.json`, `.claude/commands/` | **Needs an approved issue first.** The roster is deliberate. |
| ⚡ Slash command | `.claude/commands/legion-<name>.md` | Also add it to `.claude/commands/README.md` |
| 🛠 CLI / scanner | `src/` | TypeScript, strict mode, no new runtime deps without discussion |
| 📚 Docs | `README.md`, `ARCHITECTURE.md`, `QUICKSTART.md` | Keep examples runnable |

## Development setup

```bash
git clone https://github.com/<your-username>/legion.git
cd legion
npm install
cp .env.example .env     # optional
npm run typecheck        # must pass
npx tsx src/scripts/legion.ts status
```

## Workflow

1. Fork the repo and create a branch from `main`:
   `feat/skill-terraform`, `fix/scan-false-positive`, `docs/quickstart`
2. Make your change. Run `npm run typecheck`.
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/):
   `feat(skills): add terraform skill`, `fix(scan): ignore vendored files`
4. Push and open a PR against `main`. Fill in the PR template.
5. A maintainer reviews. Address feedback with new commits (don't force-push
   during review). PRs are **squash-merged**.

## Quality bar

- **Skills** must be specific and actionable: patterns, pitfalls, when to apply.
  Generic summaries of a technology's homepage will be declined.
- **JSON registries** must stay valid and alphabetised where they already are.
- **TypeScript** must pass `npm run typecheck` with no new `any`.
- **No secrets, ever.** If you accidentally commit one, tell a maintainer
  immediately. Rewriting history alone does not revoke a leaked key.

## Reporting bugs & security issues

- Bugs and ideas → [open an issue](https://github.com/shayomi/legion/issues/new/choose)
- Security vulnerabilities → **do not open a public issue**. See [SECURITY.md](SECURITY.md).

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).

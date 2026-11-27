# Skill: Multi-Harness Skill Distribution (one source, 16 AI coding agents)

**Category:** devops
**Agents:** conduit, forge, blueprint, titan
**Confidence:** 0.9
**Source:** project-learnt
**Learned:** 2026-08-08

## What this skill covers

Shipping one authored instruction set to every major AI coding harness — Claude Code, Cursor, Codex, Gemini CLI, GitHub Copilot, Kiro, OpenCode, Pi, Qoder, Trae, Trae CN, Rovo Dev, Mistral Vibe, Grok Build, Antigravity, plus `.agents` repo skills — without maintaining 16 forks. Learned from Impeccable's `scripts/build.js` + `scripts/lib/transformers/`.

## The transformer model

`skill/SKILL.src.md` is the single source. `PROVIDERS` in `scripts/lib/transformers/providers.js` declares 16 targets, each with:

- `configDir` — the dot-directory (`.claude`, `.cursor`, `.codex`, …)
- `providerTags` — which `<claude>…</claude>` / `<codex>…</codex>` blocks survive into this build; everyone else's are stripped
- `frontmatterFields` — which optional fields this harness actually reads
- `agentFormat` — `claude-md`, `cursor-md`, `copilot-agent-md`, or absent
- `emitHooks` + `hooksManifestRel` — where this harness discovers hooks
- `placeholderProvider` — inherit another provider's placeholder vocabulary
- `bodyTransform` — escape hatch

Placeholders substituted per provider: `{{model}}`, `{{config_file}}`, `{{ask_instruction}}`, `{{command_prefix}}` (`/` vs `$`), `{{available_commands}}`, `{{scripts_path}}`.

**Provider-tagged blocks are the key trick.** One paragraph of text can carry model-specific correction — a `<claude>` block naming Claude's own default palette rut, a `<codex>` block on sandbox permissions — and no other model ever sees it. Cheaper and far more effective than forked files.

## What the capability matrix taught

`docs/HARNESSES.md` is a dated, verified support table for frontmatter fields, subagents, and hooks across 13+ harnesses. Two lessons:

1. **Date your capability claims and say they rot.** The file opens by warning it is point-in-time and telling readers to verify live before relying on any "only X supports Y" claim.
2. **Support is not uniform and never will be.** Gemini CLI validates only `name` and `description` and ignores the rest of the spec. Codex takes metadata through a separate `agents/openai.yaml` sidecar and auto-discovers subagents bundled *inside* the skill's own `agents/` folder. Copilot repo hooks only fire once committed to the default branch. Cursor reads `.cursor/hooks.json`, not `.cursor/hooks/hooks.json`. Design for the intersection, then upgrade per provider.

All harnesses nominally follow the Agent Skills spec (agentskills.io) — `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools` — with extensions like `user-invocable`, `argument-hint`, `model`, `effort`, `hooks`.

## Generated output is committed, and that is deliberate

`.claude/skills/`, `.cursor/skills/`, `.agents/skills/` and 13 more dot-dirs are checked into the repo. `npx skills` reads them from the repo at install time, and they make submodule use clean. **Do not gitignore them.**

But they are distribution artifacts, not authoring surfaces. The discipline:

- Normal PRs are **source-first**: stage `skill/`, `scripts/`, `cli/`, `extension/`, `tests/`. Do not stage regenerated permutations.
- `bun run build` validates without syncing root harness dirs. `bun run build:release` performs the tracked sync. Two commands, so validation is cheap and the noisy sync is opt-in.
- A CI workflow (`sync-generated-output.yml`) runs `build:release` after source lands on main and commits the artifacts back. Generated diffs never pollute feature PRs.
- Local state inside harness dirs (`settings.local.json`, `.lock`) *is* gitignored.

This is the general answer to "generated code in git": commit it if an external consumer reads it from the repo, forbid it in feature branches, and let CI own regeneration.

## Build-time validators (the part most projects skip)

`scripts/build.js` fails the build on:

- `generateCounts` — the command count is derived from the router table and cross-checked against README, AGENTS.md, plugin.json, marketplace.json. Stale numbers in prose fail the build. Documentation counts *cannot* drift.
- `validatePluginVersions` — `plugin.json`, `marketplace.json`, the bundled `./plugin` manifest, and the bundled SKILL.md frontmatter must agree. This guards the marketplace install path against version drift.
- `validatePluginManifestShape` — pins the loader contract: allowed manifest keys, no `agents` key, trailing-slash `skills` path, source agents shipped. A PR once shipped an `agents` key that silently loaded **zero** agents, and `claude plugin validate` never flagged it.
- `validateSkillFrontmatter`
- `validateProse` / `validateSkillProse` — see [[llm-instruction-authoring]].

**The plugin loader E2E** (~1s, in the default suite) installs the committed `./plugin` subtree into a real Claude Code sandboxed via `CLAUDE_CONFIG_DIR` in a temp dir, then asserts the inventory from `claude plugin details`. It skips cleanly when the `claude` CLI is absent. This is the only check that catches loader-contract surprises the unit guards cannot know about. **Never add a manifest key without verifying it against a real install and extending `KNOWN_LOADER_KEYS`.**

## Independent component versioning

Three components version separately, and only the one that changed bumps:

| Component | Manifest | Bump when |
|---|---|---|
| CLI (npm) | `package.json` | `cli/` changes |
| Skills (plugin) | `.claude-plugin/plugin.json` (source of truth) + `marketplace.json` | `skill/` changes |
| Chrome extension | `extension/manifest.json` | `extension/` changes |

**Feature PRs do not bump versions and do not add changelog entries.** A version in a feature branch conflicts with every other open branch, and a changelog entry describes a release that has not happened. Bumping is a release step. The only PR that touches a manifest version is one whose purpose is the release.

Releases are tagged per component (`skill-v`, `cli-v`, `ext-v`) by `scripts/release.mjs`, which **refuses to run** if: the tree is dirty, HEAD is ahead of origin, the tag exists, the changelog entry is missing, or a release build produces uncommitted changes. That last condition is the good one — it proves the committed artifacts match the source being tagged.

## Test-suite routing

`scripts/test-suites.mjs` maps changed-file regexes to suites, so CI runs what a diff actually owes. Default: core, detector, live, framework, plugin-e2e. Opt-in (expensive, billed, or needing browsers): `live-e2e` (~2 min, real npm installs and dev servers, Playwright Chromium), `skill-behavior` (~5 min, ~$0.50–1.50 across four providers), `new-work-e2e`, `cli-remote-e2e`, `live-svelte-adapter-deepseek`, `live-e2e-accept-cleanup`.

The `triggers` list is canonical and the CLAUDE.md table explicitly says it *mirrors* it — one source of truth, one acknowledged copy, no third.

## When to apply it

- Any Legion skill or agent definition that must ship to more than one harness.
- Deciding whether generated output belongs in git.
- Building a release process for a repo with several independently shipped components.
- Adding validators that make documentation drift a build failure rather than a review comment.

## Resources

- `scripts/build.js`, `scripts/lib/transformers/{providers,factory,hooks,index}.js`, `scripts/lib/validate-plugin-manifest.js`, `scripts/release.mjs`, `scripts/test-suites.mjs`
- `docs/HARNESSES.md` — the capability matrix
- Agent Skills spec: https://agentskills.io/specification
- Related: [[impeccable-design-system]], [[llm-instruction-authoring]], [[ai-design-antipattern-detection]]

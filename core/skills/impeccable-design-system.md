# Skill: Impeccable Design Skill (AI design direction for coding agents)

**Category:** frontend
**Agents:** prism, titan, compass, lens, blueprint
**Confidence:** 0.9
**Source:** project-learnt
**Learned:** 2026-08-08

## What this skill covers

Impeccable (`pbakaus/impeccable`, Apache-2.0, npm `impeccable`, site impeccable.style) is a design skill installed into AI coding harnesses. It gives an agent a design vocabulary, a quality floor, and 23 commands so its frontend output stops looking machine-generated. Studying it teaches how to make an LLM produce design work that survives professional review.

The repo holds only the open-source product layer: the skill text, the CLI detector, the Chrome extension, and the build that fans them out to 16 harnesses. The service side (site, catalogs, world-card image pipeline, Cloudflare Pages Functions, `/api/roll`) lives in the private `pbakaus/impeccable-site`. The concept catalog is deliberately withheld as the paid-service moat.

## Architecture

**One skill, 23 commands.** Users type `/impeccable polish`, not `/polish`. The consolidation was deliberate: slash-menu pollution compounds as users install plugins. `pin.mjs` writes lightweight redirect shims for anyone who wants `/audit` standalone.

Source lives in `skill/`:
- `SKILL.src.md` (85 lines) — frontmatter, shared design laws, Modes, and the Commands router table. Provider `SKILL.md` files are generated from it.
- `reference/<command>.md` — loaded only when the router matches that command. Plus shared playbooks: `new-work.md`, `craft-floor.md`, `operate.md`, `routing.md`, and native refs `ios.md` / `android.md`.
- `skill/scripts/` — the deterministic half: `context.mjs`, `concept-seed.mjs`, `doctor.mjs`, `pin.mjs`, the hook trio, and the ~40-file live-mode subsystem.

The 23: craft (deprecated alias), shape, init, document, extract | critique, audit | polish, bolder, quieter, distill, harden, onboard | animate, colorize, typeset, layout, delight, overdrive | clarify, adapt, optimize | live. `doctor` and `hooks` are deliberately *not* in the count — maintenance tooling stays out of the design menu.

**Two orthogonal axes replaced the old brand/product register.**

*Modes* name what the visitor's success looks like, chosen **per surface, not per project**: Persuade (decide and act), Operate (complete a task), Read (understand), Experience (be inside the work). A tool's landing page is Persuade even though the product is Operate. Mode persists only in that surface's brief under `.impeccable/surfaces/`, never in PRODUCT.md.

*Platform* names the delivery target: `web` (default, no extra rulebook), `ios`, `android`, `adaptive` (both refs loaded). `extractPlatform()` reads a bare value from PRODUCT.md's `## Platform`; a missing field defaults to web so legacy projects are unaffected, and an unrecognized value prints a WARNING rather than silently getting web guidance. Where a command diverges too far to share a file it gets a `<command>.native.md` variant (`audit`, `adapt` today). **Live mode, `detect.mjs`, and the design hook are web-only** — they operate on browsers and HTML.

## The patterns worth stealing

**Rule ids as HTML comments.** Every normative sentence in the skill text carries `<!-- rule:skill-ban-gradient-text -->`. Instructions become addressable, testable, and greppable across the skill, the detector registry, and the eval harness.

**Roll the dice from outside the model.** This is the single most transferable idea in the repo. `concept-seed.mjs` exists because a model's resonance ranking is deterministic: measured, **30 of 35 runs produced identical concepts across 16 prompt framings**. The model derives its own grounded shortlist, then the script *assigns* which entry gets built and deals catalog challengers. The assignment never invents an ungrounded ingredient; it only refuses the argmax rut. A ranked lineup would hand selection back to a taste function, and taste functions pick the safest card. Re-roll (`--reroll n`) recomputes and excludes everything rounds 0..n-1 drew, so one base key reproduces the whole chain.

**The standing exit.** Every direction round offers one permanent alternative: the category standard, played straight. It is the user's door, never the agent's — never recommended, never weighed against the roll. When taken, convention becomes the commitment and gets executed at full fidelity without smuggled quirk.

**Contract-before-code.** Before writing markup, the chosen direction is stamped into the artifact's opening HTML comment (not templating frontmatter — Astro strips a slot's leading comment), five blocks under 150 words: THESIS, OWN-WORLD, STORY, FIRST VIEWPORT, FORM, plus a FINISH exit condition. After the first production build you grep the built output for the seed key; a contract the build erased is a contract nobody can audit.

**DESIGN.md is written at finish, from the built world** — never before. A rulebook written up front gets defended against reality instead of describing it.

**Bounded verification, not a loop.** Build fully, inspect once with a batched desktop+mobile round, fix everything in one batch, confirm with at most one more round, stop. Open-ended self-QA burns the user's money doing worse what the finish handoffs do better. Two rounds is the unattended budget; an attended session's ceiling belongs to the user.

**Fresh-context review.** The finish reviewer (`impeccable-finish-reviewer`) is spawned as a subagent with `fork_turns: 0` and an explicit input packet — request, artifact path, screenshot paths, direction contract, hook findings, comp paths. A reviewer that inherits the build transcript inherits its framing, its optimism, and its abstractions. Same for the documenter. Harnesses with no subagent capability fall back to `degraded/*.md` in-thread passes, and the substitution is disclosed in one line, never silently.

**Comp is king, in two phases.** Phase one is reproduction until a screenshot at the comp's width overlaps near pixel-perfect; exactly three concessions exist (fonts, icons, genuine comp defects). Only then do animation, interactivity, and responsiveness begin. Models systematically believe their CSS recreation succeeded when it did not, so the side-by-side overlap is the authority, never conviction.

**Named calibration priors.** The skill tells each model its own failure mode by name in provider-tagged blocks. The `<claude>` block: warm, bookish, family, and child-facing subjects come out cream-ground, serif-display, lamplight — treat that first palette as already spent. `<codex>`: tracking floor, ghost cards, sketchy SVG, stripe backgrounds. `<gemini>`: never animate an image on hover. Naming the specific rut beats a generic "be creative".

**The craft floor is loaded late and never announced.** Only after direction is settled, immediately before editing UI, never for planning-only work. It holds mechanics (contrast ≥4.5:1, body measure 65–75ch, tracking floor -0.04em, shadows need offset *and* blur, browser surfaces themed — selection, caret, scrollbar, focus ring) and refusals (identical card grids, hero-metric templates, eyebrows above headings, gradient text, glyphs standing in for icons, a system display face for an own-world page). It never picks the direction.

## Artifact drift: the two-tier contract

Impeccable writes files into user projects, so it must cope with artifacts an older version wrote. Three kinds of drift are handled separately: tool version (`UPDATE_AVAILABLE`), schema (deterministic, `lib/staleness.mjs`), truth (not mechanical — `document` and `init` own the rewrite).

The tier split is **a performance contract, not a preference**:
- Tier 1 (`collectBootFindings`) may only spend what a boot already spends. No directory walks, no git, no cross-workspace sweep. Adding an expensive check here taxes every session in every project.
- Tier 2 (`lib/staleness-deep.mjs`) runs on demand via `doctor.mjs`: git log, per-workspace sweep, ignore-list validation, hook resolution.

**Findings are data**: `{id, artifact, path, severity, summary, fix}` renders the boot directive, the text report, and `--json` from one set. Severity says what should happen, not how bad it is — `auto` (fixed silently on next write), `mention` (state once), `route` (name the owning command). `doctor --fix` applies only `auto`.

Emission discipline: one `CONTEXT_STALE` directive for the whole set, throttled to once a week per project in `~/.impeccable/staleness-check.json`. **Never repair drift as a side effect of a design task.**

**Deprecation carries its reason.** `PRODUCT_DEPRECATED_SECTIONS` pairs each retired field with why it went. Told only that a field is deprecated, models preserve it "just in case", which is how a retired axis keeps steering current output. (This repo's own PRODUCT.md still carries a v3 `## Register` section — its own doctor would flag it.)

**Schema versions, not release versions.** A PRODUCT.md written by v4.0.0 is not stale under v4.0.1. Stamped as `<!-- impeccable:product-schema N -->`. DESIGN.md deliberately carries no stamp: it follows the external Stitch design.md spec whose linter would reject an extra key, and every DESIGN.md signal is measurable without one.

## Live mode

Browser overlay for in-place variant generation: pick an element, choose an action, get 3 AI-authored HTML+CSS variants hot-swapped through the dev server's HMR, accept one and it is written back to source. Adapters for Vite, Next, SvelteKit, Astro, Nuxt, TanStack Start, and static HTML.

Three invariants from the 2026-07 rewrite:
- **Roots.** `live/roots.mjs` resolves appRoot/repoRoot/contextRoot once and persists `.impeccable/live/roots.json`; every CLI calls `enterLiveRoot()` and chdirs onto it. Never derive a live path from ambient cwd — a wrong cwd cannot then fork session state.
- **Svelte preview modules must live under `node_modules/.impeccable-live`.** SvelteKit's `server.fs.allow` 403s a tree under `.impeccable/`. Staleness is handled by per-publish revision dirs (`r<N>/`), not file watching.
- The append-only journal under `.impeccable/live/sessions/` is canonical and replays unacknowledged work after a restart.

Two operational rules with teeth: every tool output may carry an `_instructions` field that is **authoritative over the reference document** for that exact situation; and per-harness poll policy differs (Claude Code backgrounds it, Cursor one-shots in a background terminal — measured ~5s pickup on `--stream` vs sub-second one-shot — Codex must *service* a yielded foreground poll, never announce "waiting for the user" and idle).

## When to apply it

- Any PRISM frontend build where output must not read as AI-generated.
- Designing agent skills that need to produce taste-bearing rather than merely correct output — steal the roll, the contract comment, the fresh-context reviewer, the named-prior blocks.
- Auditing an existing UI: `npx impeccable detect` before opinions. See [[ai-design-antipattern-detection]].
- Any project shipping instructions to multiple AI harnesses. See [[multi-harness-skill-distribution]].
- Writing LLM-facing instruction text at all. See [[llm-instruction-authoring]].

## Resources

- Repo: https://github.com/pbakaus/impeccable · Site: https://impeccable.style
- Local checkout: a local clone of impeccable
- `CLAUDE.md` (project) is the maintainer's own architecture brief and the fastest orientation
- `docs/LIVE-REWRITE-PLAN.md`, `docs/adr-live-variant-mode.md`, `docs/HARNESSES.md`, `docs/STYLE.md`
- Private service repo: `pbakaus/impeccable-site` · Evals: `~/code/impeccable-evals`
- `ios.md` / `android.md` distilled from MIT-licensed `ehmo/platform-design-skills`

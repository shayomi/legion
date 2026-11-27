# Skill: AI Design Anti-Pattern Detection (static + browser rule engine)

**Category:** frontend
**Agents:** prism, aegis, lens, probe
**Confidence:** 0.9
**Source:** project-learnt
**Learned:** 2026-08-08

## What this skill covers

How to build a lint engine for *design* rather than for code: 59 rules that flag the visual tells of machine-generated UI, running over raw text, jsdom-parsed HTML, a real browser, and a Chrome DevTools panel from one rule source. Learned by reading Impeccable's `cli/engine/`.

## The rule catalogue (59, two categories)

`slop` = AI tells. `quality` = real design or a11y defects. The split matters: quality findings are defects anywhere, slop findings are defensible when a brief asks for them.

**Slop (32):** side-tab, border-accent-on-rounded, overused-font, flat-type-hierarchy, gradient-text, ai-color-palette, cream-palette, nested-cards, monotonous-spacing, bounce-easing, pulsing-dot, blinking-cursor, shape-assembled-illustration, dark-glow, radial-halo, radial-spotlight-glow, marquee, icon-tile-stack, italic-serif-display, hero-eyebrow-chip, kicker-above-heading, numbered-section-labels, em-dash-overuse, marketing-buzzword, aphoristic-cadence, oversized-h1, extreme-negative-tracking, gpt-thin-border-wide-shadow, repeating-stripes-gradient, codex-grid-background, theater-slop-phrase, image-hover-transform.

Note the shape of that list: it names *specific model reflexes*. `gpt-thin-border-wide-shadow` (the ghost card), `codex-grid-background`, `cream-palette`, `italic-serif-display` are provider-observed ruts, not generic bad taste. Several are per-model.

**Quality (27):** broken-image, script-error, content-hidden-at-rest, edge-flush-cards, text-occlusion, first-viewport-column-overflow, gray-on-color, low-contrast, layout-transition, line-length, cramped-padding, body-text-viewport-edge, tight-leading, skipped-heading, heading-rhythm, justified-text, tiny-text, undersized-ui-text, all-caps-body, wide-tracking, text-overflow, repeated-container-text, clipped-overflow-container, plus four `design-system-*` drift rules (font, color, radius, font-size outside DESIGN.md).

The `design-system-*` family is the clever one: it reads the project's own DESIGN.md and flags values that escaped the declared system. The rulebook is per-project, not universal.

## Engine architecture

`cli/engine/detect-antipatterns.mjs` is a thin facade over four directories:

- `registry/antipatterns.mjs` — the `ANTIPATTERNS` array: `id`, `category`, `name`, `description`, optional `skillSection` / `skillGuideline` linking a finding back to the guidance that would have prevented it.
- `rules/checks.mjs` — **pure** `checkXxx(opts) → [{id, snippet}]`, no DOM access, plus two adapters per rule.
- `engines/` — four entry points: `regex/detect-text.mjs` (fast path, also extracts style blocks and CSS-in-JS), `static-html/detect-html.mjs` (jsdom + a real `css-cascade.mjs`), `browser/detect-url.mjs` (Puppeteer, `getComputedStyle` + `getBoundingClientRect`), `visual/screenshot-contrast.mjs`.
- `shared/` — color (`contrastRatio`, `parseGradientColors`, `hasChroma`, OKLCH-aware), constants (`OVERUSED_FONTS`), fonts, page, `inline-ignores.mjs`.

**Every rule needs two adapters**: `checkElementXxxDOM(el)` for the browser and `checkElementXxx(el, tag, window)` for jsdom. Wire both element loops — `engines/static-html/detect-html.mjs` and `browser/injected/index.mjs`. Forgetting one is the most common bug; the symptom is "test passes, live page silent" or the reverse.

**Five sync points** for any rule change: the engine, the generated browser bundle (`bun run build:browser`), the extension (`bun run build:extension`), the site's generated counts, and the skill text if new guidance is implied.

## The TDD order (non-negotiable in that repo, and right)

1. **Fixture first** — `tests/fixtures/antipatterns/{rule-id}.html`, two columns (should-flag / should-pass), each case under a unique heading, ≥4 flag cases and ≥5 false-positive shapes.
2. **Failing test** — snippet-substring pattern against SHOULD_FLAG / SHOULD_PASS lists. Watch it fail before implementing.
3. Registry entry. 4. Pure check function. 5. Both adapters, both loops.
6. **Verify on a live page.** The two adapter paths can disagree; the fixture test cannot catch that.

Snippet format wraps the identifying heading in straight double quotes (`'icon tile above h3 "Lightning Fast"'`) so the test can extract it by regex.

## jsdom gotchas (generalizable to any headless DOM work)

- **jsdom does no layout.** `getBoundingClientRect()` returns 0×0. Read `parseFloat(style.width)` from explicit CSS instead — which means fixtures must carry explicit pixel dimensions.
- **`background:` shorthand is not decomposed.** Use `resolveBackground()` / `resolveGradientStops()`.
- **Computed colors are not normalized.** Handle hex and rgb forms both.
- **Never run the detect CLI under `bun`.** Bun's jsdom is pathologically slow; HTML scans hang for minutes. Always `node`.

## Suppression model (four levels, narrowest wins)

Shared `.impeccable/config.json` holds `detector.ignoreRules`, `ignoreFiles`, `ignoreValues`, `designSystem.enabled`, `extensions`. Private exceptions go in gitignored `config.local.json`.

Ordered preference: value-specific ignore (`ignore-value overused-font Inter`) → one-rule-in-one-file (`ignore-value <id> "*" --file <glob>`) → whole-rule → whole-file. `ignore-file` silences every rule forever *including rules not yet written*, so it is reserved for fixtures and deliberate slop demos. A bare `"*"` with no `--file` is refused outright.

Inline `impeccable-disable <rule>` / `-line` / `-next-line` markers exist but are reserved for files that leave the repo (exported documents, emailed HTML) — config ignores keep suppressions in one reviewable place. `--no-config` gives a raw run.

`detector.extensions` covers server-side templates (`{"ext": ".blade.php", "engine": "html"}`), matched against the end of the filename so `.html.erb` works.

## The hook: two-tier interruption

The per-edit hook fires on `.tsx/.jsx/.html/.vue/.svelte/.astro/.css/.scss/.ts/.js` writes and surfaces **only the immediate tier** — mechanical, unambiguous problems worth interrupting for: broken images, overflow, clipping, contrast, gradient text, glow shadows, design-system drift. Everything taste-shaped (copy cadence, palette, layout rhythm) defers to a deep pass on the `Stop` event, run once over every UI file touched in the session, deduplicated against what per-edit already said.

That tiering is the transferable lesson: **an interrupting linter must only interrupt for the undebatable.** Taste findings batched at the end get read; taste findings mid-edit get ignored, then disabled.

Harness differences are real: Cursor uses `preToolUse` and **blocks** the bad write before it lands (denial message is visible to the agent as a tool error). Claude Code, Codex, and Copilot use post-tool-use reminders. Copilot keeps full rules per edit because its stop events do not feed context back to the model.

## When to apply it

- Building any lint/scan engine that must run in Node, jsdom, and a live browser from one source.
- Adding automated design QA to a PRISM/AEGIS pipeline: `npx impeccable detect --fast --json src/` in CI, full scan pre-release.
- Designing suppression config for any linter — the four-level narrowest-wins model is better than most real linters ship.
- Writing agent hooks generally: the immediate/deferred tier split applies to any post-tool-use feedback loop.

## Resources

- `cli/engine/` in a local clone of impeccable
- Reference rules to copy: `side-tab` (border), `low-contrast` (color+gradient), `icon-tile-stack` (sibling), `flat-type-hierarchy` (page-level), `kicker-above-heading` (heading-anchored with rule-ownership stand-down)
- `skill/reference/hooks.md`, `skill/scripts/hook-lib.mjs` (`IMMEDIATE_TIER_RULES`, `ADVISORY_RULES`)
- `npx impeccable detect [file|dir|url] [--fast] [--json] [--no-config]`
- Related: [[impeccable-design-system]], [[multi-harness-skill-distribution]]

# Skill: LLM Instruction Authoring (writing skill text models actually obey)

**Category:** process
**Agents:** titan, memory, lens, aegis, compass
**Confidence:** 0.9
**Source:** project-learnt
**Learned:** 2026-08-08

## What this skill covers

The craft of writing agent-facing instructions — skills, references, playbooks — so a model does the thing rather than acknowledging it. Distilled from Impeccable's `skill/` (~5,000 lines of reference prose), `docs/STYLE.md`, and `tests/skill-behavior/`.

## Load discipline: context is the budget

**Load one playbook, at the moment it applies.** SKILL.src.md is 85 lines and routes; the reference file for the matched command is loaded and nothing else. `craft-floor.md` is loaded *after* direction is settled and *only* immediately before editing UI — never for planning-only work.

**Do not reintroduce per-domain reference files.** Impeccable v4 deleted `typography.md`, `color-and-contrast.md`, `spatial-design.md`, `motion-design.md`, `interaction-design.md`, `responsive-design.md`, `ux-writing.md`, `cognitive-load.md`, `personas.md`, `heuristics-scoring.md`, and more. The content moved into the command references and the craft floor, where it loads only when it applies. A per-topic file is a file every session pays for.

**Native variants over in-file translation notes.** Where a command's guidance diverges by platform, ship `<command>.native.md` and route to it instead — don't make native runs read web content and mentally translate. Where the platform reference already covers the divergence, ship nothing extra.

## Placement changes behavior

**Accessibility guidance lives in `audit.md`, not in SKILL.md or the mode guidance.** The stated reason: models over-cautious themselves into safe, underdesigned output when reminded about accessibility at design time. Give the check a dedicated command and a dedicated moment. The general form: a constraint mentioned during generation shapes generation, whether you wanted it to or not.

**Deprecation must carry its reason.** `PRODUCT_DEPRECATED_SECTIONS` maps each retired field to *why* it went. Told only that a field is deprecated, models preserve it "just in case" — which is how a retired axis keeps steering current output. Same instinct behind "treat that field as absent for every decision from here on, whatever value it holds".

**Name the model's own rut.** Provider-tagged blocks tell each model its specific failure mode: Claude's cream/serif/lamplight prior for warm subjects, Codex's ghost card and sketchy SVG, Gemini's image-hover reflex. "Treat that first palette as already spent" beats "be creative" by a wide margin.

**Say what a number measures.** `design-md-drift` counts commits since DESIGN.md changed. The instruction is explicit: report the number, say what it measures, *never assert the document is stale because the number is large*. Proxies must be labeled as proxies or the model will state them as conclusions.

## Bounding open-ended behavior

Models loop. Every expensive loop in the repo has a named ceiling and an explicit successor:

- Verification is **bounded passes, not a loop**, and the ceiling covers the whole cycle — screenshots, defect scans, micro-edits, and rebuilds alike. Build fully, inspect once (desktop and mobile *together*, one render), fix in one batch, confirm with at most one more round, stop. "Open-ended self-QA burns the user's money doing worse what the finish handoffs do better."
- Two rounds is the unattended budget. Attended, the ceiling belongs to the user: put the table in front of them and let them fund another round.
- "Stop the moment a round resolves nothing."
- "The reviewer's findings are the only list you work from, never your own re-opened hunt."
- Ask **one round** of two or three questions, skipping settled facts.
- "Wait on any agent with one long timeout rather than a loop of short polls, and spend the wait on the next independent step."

The pattern: name the ceiling, name what the leftover work routes to, and forbid the substitute activity by name.

## Fresh context beats more context

Review runs in a subagent spawned with **no forked conversation history** (`fork_turns: 0`) and an explicit input packet. Stated reason: a reviewer that inherits the build transcript inherits its framing, its optimism, and its abstractions. Everything it needs travels in the inputs.

Corollaries in the text: "the reviewer has no browser; screenshots you fail to pass are checks it cannot run" (an isolated agent's blind spots must be enumerated), "never read the shipped agents' definition files before spawning; you owe only the input packet", and every degraded in-thread substitution is **disclosed in one line, never silently**.

## Runtime output outranks the document

"Every tool output in live mode may carry an `_instructions` field: it is the authoritative next step for that exact situation, with real ids and paths substituted; when it conflicts with your recollection of this document, `_instructions` wins."

Static prose cannot know the ids. Let scripts emit situation-specific next steps and give them explicit precedence over the reference. This also lets the reference stay short.

## Make the deterministic thing deterministic

Anywhere the model's judgment is known to converge, move the decision into a script and make running it a contract. `concept-seed.mjs` assigns which direction gets built because 30 of 35 measured runs produced identical concepts. The instruction is blunt: "This step has no substitute and no skip condition: writing artifact code before this script has run and its assignment is acknowledged is a contract violation, whatever the harness, the model, or the time pressure."

Blanket, exception-free, reason-stated. That phrasing survives pressure; "prefer to run the script" does not.

## Prose gates, enforced in CI

`docs/STYLE.md` is an editorial brief whose bar is: **for every paragraph, point to the sentence that makes it specifically yours.** Twelve principles worth keeping — open with the reader's wrong belief; take a position someone could disagree with; name names and use numbers ("cut 'lightweight', write '54 KB'"); vary sentence length on purpose ("smooth uniform rhythm is the deepest AI tell"); prose carries the load, bullets are for parallel options; concrete over comprehensive, because "coverage is an AI obsession"; close by handing off the next move.

Two gates run at build time because the full ruleset does not fit LLM-facing text:

- `validateProse` on the READMEs: em dashes, `--`, `load-bearing`, `highest-leverage`, `biggest unlock`, `seamless`, `robust`, `delve`, `elevate`, `empower`, `underscore`, `pivotal`, `tapestry`, `data-driven`, `reflex defaults`, `collapses into monoculture`, `in today's`, `gone are the days`, `whether you're`, `let's dive in`, `in summary`, `in conclusion`, `moreover`, `furthermore`. Each rule prints its rationale and a suggested replacement when it fires.
- `validateSkillProse` on `skill/**/*.md` only: em dashes plus the subset with no technical reading. Words with legitimate technical uses (`seamless`, `robust`, `elevate`) are *not* enforced there. Code comments in `skill/scripts/**` are exempt.

**"Do not silently work around the regex."** A banned word that has earned a real meaning is a STYLE.md amendment, not a rephrase. That rule is what keeps the denylist honest.

The deeper tells the regex cannot catch are listed for human passes: negation pivot ("it's not X, it's Y"), triadic auto-pilot, uniform paragraph rhythm, hollow confidence.

## Testing instructions as behavior

`tests/skill-behavior/` inlines the *source* SKILL.md into a real LLM's system prompt, gives it bash/read/write/list scoped to a temp workspace, and **asserts on the tool-call trace, not on free-form output**. The trace is the source of truth. A companion `workflow-contract.test.mjs` asserts question order and artifact writes end to end.

Two rules with real bite:

- **Every provider, every run** — `claude-sonnet-5`, `gpt-5.6-luna`, `gemini-3.5-flash`, `deepseek-v4-flash`. "Many of the most useful findings come from divergence between providers." Testing one model tells you about one model.
- **The harness symlinks source, not built output**, so edits show up without a rebuild. Reference files then surface raw `{{placeholders}}` — irrelevant, because assertions key on tool calls rather than content.

Providers skip cleanly when their key is unset rather than failing. The scenario list and baseline live in the suite's own README, not in the project brief — "duplicating it in this file is how it went stale before."

## When to apply it

- Writing or reviewing any Legion agent definition, skill doc, or protocol file.
- Any time an agent loops, over-verifies, or hedges: apply the bounded-pass and named-ceiling patterns.
- Reviewing user-facing copy for AI tells — the STYLE.md denylist and the four structural tells port directly.
- Building tests for prompt/instruction changes: assert on traces, sweep providers.

## Resources

- `docs/STYLE.md` in a local clone of impeccable
- `skill/SKILL.src.md`, `skill/reference/new-work.md`, `skill/reference/craft-floor.md`
- `tests/skill-behavior/README.md` (scenario table + baseline), `scripts/build.js` (`validateProse`, `validateSkillProse`)
- Related: [[impeccable-design-system]], [[multi-harness-skill-distribution]]

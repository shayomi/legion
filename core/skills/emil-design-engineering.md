# Skill: Emil Design Engineering (collection)
**Category:** frontend
**Agents:** prism (primary), lens, titan, compass, aegis, probe, blueprint, forge
**Confidence:** 0.9
**Source:** user-taught (installed collection)
**Learned:** 2026-09-01

## What this skill covers

A 12-skill design-engineering collection covering interface craft, motion, and
Apple-style interaction. Installed to `~/.agents/skills/`, symlinked into
`~/.claude/skills/`. This doc is an **index and routing guide** — the full text
lives in each skill's own `SKILL.md` and is not duplicated here, so there is one
source of truth and no drift.

## The skills

### Foundations — how it should feel
| Skill | Covers |
|---|---|
| `apple-design` | Apple's fluid-interface model translated to the web. 17 sections, distilled from WWDC 2018 *Designing Fluid Interfaces*. |
| `emil-design-eng` | Craft philosophy: UI polish, component design, the invisible details. |

The `apple-design` through-line, worth internalising:
> Motion starts from the current on-screen value, inherits the user's velocity,
> projects momentum forward, and can be grabbed and reversed at any instant.

Springs are the tool that makes this natural — they are inherently interruptible
and velocity-aware. Interruptibility is named as the single most important principle.

### Implementation — writing the motion
| Skill | Covers |
|---|---|
| `animate` | Web. Decisions in the order that determines whether motion feels right: should it animate at all → purpose → tool → properties → curve/duration → interruption → exit. |
| `animate-expo` | React Native / Expo. Reanimated, Gesture Handler, Expo Router, haptics; which thread it runs on, gesture handoff, degradation. |

### Analysis — judging existing motion
| Skill | Covers | Scope |
|---|---|---|
| `review-animations` | Reviews motion against a craft bar. *Approval is earned.* | A diff |
| `improve-animations` | Prioritised audit + implementation plans for other agents to execute. Read-only. | A codebase |
| `find-animation-opportunities` | Finds what doesn't animate but should — and rejects what shouldn't. Read-only. | A codebase |

### Support
| Skill | Covers |
|---|---|
| `animation-vocabulary` | Reverse lookup: vague description → exact term ("bouncy thing when a popover opens" → Pop in). |
| `prototype` | Builds several genuinely different versions behind a visual picker. |
| `pick-ui-library` | Opinionated picks: charts, OTP inputs, command menus, virtualization, DnD, toasts. |
| `ask-sonner` | Sonner toast library — setup and troubleshooting. |
| `write-swift` | Modern Swift: value types, Swift 6 data-race safety, concurrency, Swift Testing. |

## IMPORTANT: three require explicit invocation

`review-animations`, `prototype`, and `pick-ui-library` carry
`disable-model-invocation: true` in their frontmatter. They will **not** trigger
on their own — no amount of context makes them fire. Call them by name.

A plain "review this component" will NOT run `review-animations`.

## When to apply it

- **PRISM** — any component with motion, gesture, or transition. Pairs with the
  standing component-folder rule: these govern how a component *feels*,
  [[component-folder-architecture]] governs how it is *organised*. No conflict.
- **LENS** — invoke `review-animations` by name on frontend diffs touching motion.
- **AEGIS / PROBE** — `find-animation-opportunities` for gaps; reduced-motion and
  interruptibility are testable behaviours, not just aesthetics.
- **TITAN / COMPASS** — `apple-design` foundations when setting product feel.

## Precedence

Overlaps ECC's `motion-foundations` / `motion-ui` and the built-in
`design-motion-principles`. Where they disagree, prefer this collection — it is
more opinionated and more specific. Related: `impeccable-design-system`,
`ai-design-antipattern-detection`.

## Resources

- Canonical text: `~/.agents/skills/<skill-name>/SKILL.md`
- Deeper references: `review-animations/STANDARDS.md`, `prototype/PICKER.md`
- Origin: Emil Kowalski's design-engineering work; `apple-design` derives from
  Apple's WWDC design talks, chiefly *Designing Fluid Interfaces* (2018).

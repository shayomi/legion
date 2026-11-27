# Skill: Component Folder Architecture
**Category:** frontend
**Agents:** frontend, reviewer, cto
**Confidence:** 0.9
**Source:** user-taught
**Learned:** 2026-08-10

## What this skill covers

How component code is organised in every Legion frontend project: grouping components
into domain folders instead of one flat directory, and splitting any component that has
grown long into a folder of focused files. This is the standing default, not a one-off
refactor. Apply it while building, so components never reach the point of needing a
rescue pass.

## Key patterns and approaches

### 1. Group by domain, never leave a flat `components/`

A flat `components/` directory stops being navigable at roughly a dozen files. Group by
the part of the product a component serves:

```
components/
├── auth/        sign-in, providers, guards
├── dashboard/   shell, cards, insights, meters
├── models/      model selection and context
├── sessions/    the core working surface
├── tools/       standalone utilities
└── ui/          shared primitives: icons, theme, motion, typography
```

The folder names come from the product, not from React vocabulary. `sessions/` is a good
folder; `containers/`, `hocs/` and `smart/` are not. `ui/` is the one exception: it holds
domain-free primitives that anything may import.

Two rules keep the grouping honest:

- **File by where it renders, not by what it reads.** A usage meter that consumes model
  context but lives in the dashboard chrome belongs in `dashboard/`, not `models/`.
- **A folder with one file is fine** if it names a category that is going to grow. Do not
  force-fit that file elsewhere just to avoid a thin folder.

### 2. Split any component over ~200 lines into a folder

When a single component file passes roughly 200 lines, it is almost always doing three
jobs at once: state, data fetching, and markup. Convert the file into a folder of the
same name:

```
session-configurator.tsx          (449 lines, does everything)

  ↓ becomes

session-configurator/
├── index.tsx                     the composed shell, ~100 lines
├── use-session-configurator.ts   all state, fetching, derived values
├── types.ts                      shared types and constants
├── task-step.tsx                 one presentational piece
├── style-step.tsx
├── model-step.tsx
└── options-step.tsx
```

The parts, and what each is for:

- **`index.tsx`** exports the public component. It calls the hook, lays out the pieces,
  and holds nothing else. If it is growing past ~120 lines, another piece wants
  extracting.
- **`use-<name>.ts`** owns every `useState`, `useEffect`, fetch call, and derived value.
  Returning derived values from the hook (filtered lists, grouped data, boolean flags) is
  what keeps `index.tsx` thin. Mark it `"use client"`.
- **`types.ts`** holds types and constants shared across the folder. Import shared app
  types from `lib/`; only local shapes live here.
- **Presentational files** take props and render. No fetching, no stores. They may hold
  small private sub-components below the exported one.
- **Pure logic** (formatters, parsers, calculators) goes in its own `.ts` with no React
  import. This is the highest-value extraction in the whole pattern: it is the part worth
  unit testing, and it cannot be tested while trapped inside a component.

Because the folder has an `index.tsx`, **every existing import keeps working unchanged**.
`@/components/sessions/session-configurator` resolves to the folder. Splitting a component
is therefore a safe, local operation with no call-site churn.

### 3. Naming

- Files and folders in kebab-case: `session-configurator/`, `use-session-chat.ts`.
- Hooks are `use-<component-name>.ts` when general, or named for the job they do
  (`use-session-chat.ts`) when that reads better.
- One exported component per presentational file, named for the slot it fills
  (`workspace-header`, `message-list`, `composer`), not for its position (`part-one`).

### 4. Verify after any move

Run in this order. Do not report the work as done before all three pass:

```bash
npx tsc --noEmit     # catches every broken import path
npx eslint src       # note pre-existing findings separately from new ones
npx next build       # confirms nothing broke at runtime
```

Rewrite import paths mechanically rather than by hand: `grep -rl` for the old path, then
a scripted substitution over the matched files. Confirm the count of rewritten imports.

## When to apply it

- **Always, while building.** Put a new component in its domain folder from the first
  commit. Reach for a folder split the moment a component starts mixing state and markup,
  rather than waiting for a cleanup pass.
- On any existing project whose `components/` is flat or contains 200+ line files.
- During LENS review: a flat components directory or an over-long component is a finding,
  not a matter of taste.

## Anti-patterns

- **Barrel files that re-export everything** (`components/index.ts`). They defeat
  tree-shaking and create import cycles. The per-folder `index.tsx` for a split component
  is a different thing and is fine, because it exports one component.
- **Splitting by file type** (`hooks/`, `types/`, `components/` at the top level). It
  scatters one feature across three directories. Co-locate instead.
- **Extracting a piece used exactly once, with twelve props.** That is not a component,
  it is a function call wearing a costume. Only split where the seam is real.
- **Moving files and skipping the build.** `tsc` passing is necessary but not sufficient.

## Worked example

Viva (`thesis/viva/web`), 2026-08-10: 18 flat components, four of them 226-449 lines.
Grouped into six domain folders and split the four long ones into folders of 5-7 files.
Result: 49 imports rewritten across 30 files, every component file under 145 lines except
the icon registry, `tsc` clean, all 32 routes building. The citation formatter came out as
a 98-line pure `format.ts` with no React import, testable for the first time.

## Resources

- `thesis/viva/web/src/components/` — reference implementation of this layout

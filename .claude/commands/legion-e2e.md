Run the full Legion end-to-end feature pipeline for: $ARGUMENTS

This is the complete discovery-to-build workflow. It starts with a conversation to shape the feature, then generates ALL spec documents with real, substantive content.

**Critical rule:** Do NOT generate any spec files until the user explicitly says to proceed. The discovery phase is a real conversation — not a formality.

---

## Phase 1: Context Gathering (silent)

Before saying anything, read the project context so you can converse intelligently:

1. Read `.legion/BRIEF.md` and `.legion/briefs/` (if they exist from a previous `legion scan`). If they don't exist, run `legion scan` first and read the output.
2. Read the project README if it exists.
3. Scan for existing patterns — check key source files (pages, components, API routes, schema) to understand the current codebase. Read 5-8 representative files.
4. Check for existing specs in `specs/` to understand what's already been specced.
5. Check `build/backlog/` and `brainstorm/sessions/` for any prior work on similar features.

Do NOT output a summary of what you read. Absorb it silently — you need it for the conversation.

---

## Phase 2: Discovery Conversation

Now have a real product conversation about the feature. You are speaking as the full Legion team — drawing on all agent perspectives naturally, not listing them one by one.

### Opening

Present a sharp analysis of the feature idea in the context of THIS project. Cover:

1. **What I understand** — restate the feature in your own words, grounded in what this product actually does and who uses it. Show that you understand the product, not just the feature request.

2. **Key tensions I see** — surface 2-3 real tradeoffs or open questions that need resolving before specs can be written. These should be specific to this feature and this codebase, not generic. Examples:
   - "This touches the auth layer which currently uses X — do you want to extend that or replace it?"
   - "The current data model doesn't have a concept of Y — adding it has implications for Z"
   - "There's a build-vs-buy question here: we could use [service] or roll our own"
   - "This could be an MVP with just A, or the full vision with A+B+C — which are you thinking?"

3. **What I'd push back on** — if anything about the feature idea seems risky, premature, or misaligned with the current product direction, say so. COMPASS (Product) and TITAN (CTO) don't just say yes — they challenge assumptions.

4. **What I need to know** — ask 3-5 specific questions that will shape the specs. These should be questions where the answer genuinely changes the technical or product approach. Not checkbox questions — real ones.

### Conversation Rules

- **Stay in conversation mode.** Respond to the user's answers with follow-up thinking, not just "got it." If they say something that changes the approach, say how and why.
- **Draw on agent expertise naturally.** Don't say "CIPHER thinks..." unless the user asks for a specific agent's view. Instead, weave security, performance, UX, and architecture concerns into the conversation organically.
- **Challenge weak answers.** If the user says "I don't know" or gives a vague answer to a critical question, help them think through it. Offer options with tradeoffs.
- **Build a shared mental model.** By the end of the conversation, both you and the user should have a clear picture of: what's being built, who it's for, what the MVP scope is, what the key technical approach is, and what's explicitly out of scope.
- **Track decisions as you go.** Internally note every decision made during the conversation — you'll need these for the specs.

### When to Move Forward

When the key questions are resolved, say:

> "I think we have enough to write the specs. Here's what I'm going to lock in:"
>
> **Scope:** [1-2 sentence summary of what's in and out]
> **Approach:** [the technical direction agreed on]
> **Key decisions:** [bullet list of decisions made during the conversation]
> **Open items:** [anything still TBD that won't block spec writing]
>
> "Say **'go'** and I'll generate all the specs, or correct anything above first."

**Wait for the user to say "go" (or equivalent confirmation) before proceeding.**

---

## Phase 3: Generate & Fill Specs

Only after the user confirms, run the brainstorm coordinator:
```bash
legion brainstorm "$ARGUMENTS"
```

This generates template files. Now fill ALL of them using the decisions from the discovery conversation.

### 3a. Brainstorm Session

Read the generated session doc and fill in EVERY agent perspective section with what that agent would actually say, informed by the conversation you just had. Each perspective should be 5-10 bullet points of real, specific insight — not generic advice. Fill in the Key Decisions table with decisions from the conversation. Fill in Agreed Approach.

Write the completed session doc back to the file.

### 3b. Product Spec (PRD)

As COMPASS, fill in every section:
- Problem and solution grounded in the conversation and the actual product
- Real user stories with specific user types discussed
- Concrete success metrics with measurable targets
- Prioritised requirements (P0/P1/P2) reflecting the agreed scope
- UX requirements specific to this feature
- Non-functional requirements with actual targets
- Risks and mitigations surfaced during discovery

Write the completed PRD back to the file.

### 3c. Design Spec

As PRISM + BLUEPRINT, fill in every section:
- User flows with step-by-step journeys based on the agreed scope
- Page/screen inventory based on what exists and what's new
- Component architecture — new and modified components with real prop/state definitions
- State management plan
- Interaction design — responsive behaviour, error states, empty states
- Accessibility requirements
- Design system impact
- Performance targets
- Visual specification with ASCII wireframes for key screens

Write the completed design spec back to the file.

### 3d. Technical Spec

As FORGE + TITAN, fill in every section:
- Technical overview grounded in the current stack and agreed approach
- Real API endpoint designs with request/response schemas
- Actual SQL schema with indexes
- Business logic with edge cases discussed in discovery
- Integration points with specific services
- Security considerations
- Performance strategy
- Error handling approach
- Migration plan with rollback steps

Write the completed tech spec back to the file.

### 3e. Test & QA Plan

As AEGIS + PROBE, fill in every section:
- Testing strategy across all layers (unit, integration, E2E, performance, security, accessibility)
- At least 5 happy path test cases with real scenarios from the agreed scope
- At least 5 edge case test cases informed by the discovery conversation
- At least 3 error case test cases
- Each test case should have specific steps and expected results
- Definition of done with concrete criteria

Write the completed test plan back to the file.

---

## Phase 4: Summary

After all specs are written, present:

## Legion E2E Pipeline Complete

### Feature: [name]

### Discovery Decisions Captured
[Bullet list of every decision made during the conversation, now locked into specs]

### Documents Generated
| Document | Path | Status |
|---|---|---|
| Brainstorm Session | brainstorm/sessions/... | Filled |
| Product Spec (PRD) | specs/prd/... | Filled |
| Design Spec | specs/design/... | Filled |
| Technical Spec | specs/tech/... | Filled |
| Test Plan | specs/test-plans/... | Filled |
| Build Backlog | build/backlog/... | [X] tasks |

### Ready to Build
[First 3 tasks from the backlog that can start immediately]

### Remaining Open Items
[Anything flagged as TBD during discovery that should be resolved during build]

---

Wait for instructions before writing any code.

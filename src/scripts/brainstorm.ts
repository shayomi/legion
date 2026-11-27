#!/usr/bin/env tsx
/**
 * Legion Brainstorm Coordinator v2.0 (TypeScript)
 * ────────────────────────────────────────────────────────────────────────────
 * Produces the full spec suite from a single feature description:
 *   brainstorm/sessions/, specs/prd/, specs/tech/,
 *   specs/design/, specs/architecture/, specs/test-plans/, build/backlog/
 *
 * Usage:
 *   npm run brainstorm "Real-time collaborative document editing"
 */

import path from 'path';

import { type BuildTask, type BuildBacklog } from '../types/index';
import { c, ok, head, log, writeFile, LEGION_ROOT, TODAY, NOW } from '../lib/utils';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROOT = LEGION_ROOT;
const ID   = `bs_${Date.now()}`;

const FEATURE = process.argv.slice(2).join(' ');
if (!FEATURE) {
  console.log(`${c.bold}Usage:${c.reset} npm run brainstorm "<feature description>"`);
  process.exit(1);
}

const SLUG = FEATURE.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);

head(`LEGION BRAINSTORM — ${ID}`);
log(`Feature: ${FEATURE}`);

// ── 1. Brainstorm session document ────────────────────────────────────────────

const sessionDoc = `# Brainstorm Session — ${FEATURE}
**Session ID:** ${ID}
**Date:** ${TODAY}
**Feature:** ${FEATURE}

---

## Problem Statement
_What problem does this solve? Who experiences it? What is the impact?_

[ FILL IN ]

---

## Agent Perspectives

### CTO (TITAN) — Strategic & Architecture View
- What is the highest-leverage architectural approach?
- What are the build vs buy considerations?
- What risks must be mitigated from day one?
- What does technical success look like?

[ FILL IN ]

### Product Manager (COMPASS) — Product & User View
- Who is the primary user and what is their job to be done?
- MVP vs full vision?
- What are the success metrics?
- What are the risks of building this?

[ FILL IN ]

### Frontend (PRISM) — UI/UX View
- What user interactions are involved?
- Component architecture?
- Performance and accessibility considerations?
- Design system impact?

[ FILL IN ]

### Backend (FORGE) — API & Data View
- What APIs need to be built or modified?
- What data model changes are needed?
- Integration points?
- Scaling considerations?

[ FILL IN ]

### Cloud (STRATUS) — Infrastructure View
- What infrastructure is needed?
- Scaling and cost implications?
- Region/availability requirements?
- Changes to existing infrastructure?

[ FILL IN ]

### DevOps (CONDUIT) — Delivery View
- How will this be deployed?
- Monitoring and alerting needed?
- Rollback strategy?
- Feature flags or progressive rollout?

[ FILL IN ]

### Cyber (CIPHER) — Security View
- What is the threat surface?
- Auth/authorisation concerns?
- Data sensitivity?
- Compliance considerations?

[ FILL IN ]

### QA (AEGIS) — Quality View
- Testing strategy?
- Critical test cases?
- Edge cases and failure modes?
- Performance criteria?

[ FILL IN ]

### Intel (ORACLE) — Market & Competitive View
- How do competitors solve this?
- Market expectations?
- Standards or patterns to follow?
- What can we learn from existing solutions?

[ FILL IN ]

### Legal/Compliance (SHIELD) — Risk View
- Regulatory requirements?
- Data handling obligations?
- IP or third-party licensing?

[ FILL IN ]

---

## Key Decisions

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| | | | |

---

## Open Questions

- [ ]
- [ ]
- [ ]

---

## Agreed Approach

[ FILL IN AFTER DISCUSSION ]

---

## Next Steps

| Action | Owner | Deadline |
|---|---|---|
| Write PRD | product-manager | |
| Write Tech Spec | cto + backend | |
| Write Design Spec | frontend + solutions-architect | |
| Write Architecture Doc | solutions-architect | |
| Write Test Plan | qa | |
| Create build tasks | project-manager | |

---
_Facilitated by Legion. Outputs saved to specs/ and build/backlog/_
`;

const sessionPath = path.join(ROOT, 'brainstorm', 'sessions', `${TODAY}-${SLUG}.md`);
writeFile(sessionPath, sessionDoc);
ok(`Session: ${sessionPath}`);

// ── 2. PRD ────────────────────────────────────────────────────────────────────

const prd = `# Product Requirements Document
**Feature:** ${FEATURE}
**Author:** COMPASS (Product Manager)
**Brainstorm Ref:** ${ID}
**Date:** ${TODAY}
**Status:** Draft

---

## 1. Overview

### Problem
_Describe the problem this solves._

### Solution
_High-level description of the proposed solution._

### Success Metrics
| Metric | Baseline | Target | Measured By |
|---|---|---|---|
| | | | |

---

## 2. Users & Use Cases

### Primary Users
_Who uses this feature?_

### User Stories
- As a **[user type]**, I want to **[action]** so that **[outcome]**.
- As a **[user type]**, I want to **[action]** so that **[outcome]**.

### Out of Scope
- _What is explicitly NOT in this release_

---

## 3. Feature Requirements

### Must Have (P0)
- [ ]

### Should Have (P1)
- [ ]

### Nice to Have (P2)
- [ ]

---

## 4. UX Requirements
_Key UX principles, flows, and constraints._

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Performance | |
| Availability | |
| Data retention | |
| Accessibility | WCAG 2.1 AA |

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| | | | |

---

## 7. Open Questions
- [ ]

---

## 8. Approvals
- [ ] TITAN (CTO)
- [ ] COMPASS (Product Manager)
- [ ] SHIELD (Legal/Compliance)
- [ ] Legion (Principal)

---
_Generated by Legion Brainstorm Coordinator v2.0. Ref: ${ID}_
`;

const prdPath = path.join(ROOT, 'specs', 'prd', `${TODAY}-${SLUG}-prd.md`);
writeFile(prdPath, prd);
ok(`PRD: ${prdPath}`);

// ── 3. Tech Spec ──────────────────────────────────────────────────────────────

const techSpec = `# Technical Specification
**Feature:** ${FEATURE}
**Author:** FORGE (Backend) + TITAN (CTO)
**Brainstorm Ref:** ${ID}
**PRD Ref:** specs/prd/${TODAY}-${SLUG}-prd.md
**Date:** ${TODAY}
**Status:** Draft

---

## 1. Technical Overview
_High-level description of the implementation._

---

## 2. System Context
\`\`\`
[ System diagram or description ]
\`\`\`

---

## 3. API Design

### \`POST /api/v1/[resource]\`
**Description:** _What does this do?_
**Auth:** Required / Optional / None

**Request:**
\`\`\`json
{}
\`\`\`

**Response 200:**
\`\`\`json
{}
\`\`\`

**Errors:**
| Code | Reason |
|---|---|
| 400 | |
| 401 | |
| 500 | |

---

## 4. Data Model

\`\`\`sql
CREATE TABLE [name] (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- fields
);
\`\`\`

### Indexes
\`\`\`sql
-- Performance-critical indexes
\`\`\`

---

## 5. Business Logic
_Core algorithms, rules, edge cases._

---

## 6. Integrations
| Service | Type | Purpose |
|---|---|---|
| | | |

---

## 7. Security
_Auth, input validation, data handling, secrets._

---

## 8. Performance
_Expected load, caching strategy, query optimisation._

---

## 9. Error Handling
_How errors are caught, logged, surfaced._

---

## 10. Migration Plan
_Safe rollout. Rollback steps._

---

## 11. Technical Debt
_What was cut? What to revisit?_

---

## Approvals
- [ ] TITAN
- [ ] LENS (code review)
- [ ] CIPHER (security)
- [ ] STRATUS (cloud/infra)

---
_Generated by Legion Brainstorm Coordinator v2.0. Ref: ${ID}_
`;

const techPath = path.join(ROOT, 'specs', 'tech', `${TODAY}-${SLUG}-tech-spec.md`);
writeFile(techPath, techSpec);
ok(`Tech spec: ${techPath}`);

// ── 4. Architecture doc ───────────────────────────────────────────────────────

const archDoc = `# Architecture Document
**Feature:** ${FEATURE}
**Author:** BLUEPRINT (Solutions Architect)
**Brainstorm Ref:** ${ID}
**Date:** ${TODAY}
**Status:** Draft

---

## 1. Architecture Decision

### Decision
_What approach was chosen?_

### Alternatives Considered
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| | | | |

### Rationale
_Why this approach?_

---

## 2. Component Diagram
\`\`\`
[ ASCII or Mermaid diagram ]
\`\`\`

---

## 3. Data Flow
\`\`\`
[ How data moves through the system ]
\`\`\`

---

## 4. Infrastructure Requirements
| Component | Current | Required | Change |
|---|---|---|---|
| | | | |

---

## 5. Scalability & Reliability
_How does it scale? Failure modes? SLA?_

---

## 6. Security Architecture
_Trust boundaries, data classification._

---

## ADR-${Date.now()}
- **Status:** Proposed
- **Context:** ${FEATURE}
- **Decision:**
- **Consequences:**

---
_Generated by Legion Brainstorm Coordinator v2.0. Ref: ${ID}_
`;

const archPath = path.join(ROOT, 'specs', 'architecture', `${TODAY}-${SLUG}-architecture.md`);
writeFile(archPath, archDoc);
ok(`Architecture: ${archPath}`);

// ── 5. Design spec ──────────────────────────────────────────────────────────

const designSpec = `# Design Specification
**Feature:** ${FEATURE}
**Author:** PRISM (Frontend) + BLUEPRINT (Solutions Architect)
**Brainstorm Ref:** ${ID}
**PRD Ref:** specs/prd/${TODAY}-${SLUG}-prd.md
**Date:** ${TODAY}
**Status:** Draft

---

## 1. Design Overview
_High-level design vision. What does this look and feel like?_

---

## 2. User Flows

### Primary Flow
\`\`\`
[ Step-by-step user journey — entry point → action → outcome ]
\`\`\`

### Alternate Flows
\`\`\`
[ Edge cases, error states, empty states ]
\`\`\`

---

## 3. Page / Screen Inventory

| Page/Screen | Purpose | Key Components | Priority |
|---|---|---|---|
| | | | |

---

## 4. Component Architecture

### New Components
| Component | Props | State | Reusable? |
|---|---|---|---|
| | | | |

### Modified Components
| Component | Change | Reason |
|---|---|---|
| | | |

### Component Hierarchy
\`\`\`
[ Tree diagram of component nesting ]
\`\`\`

---

## 5. State Management
_What state is needed? Where does it live? Client vs server state._

| State | Location | Source | Updates |
|---|---|---|---|
| | | | |

---

## 6. Interaction Design

### Animations & Transitions
_Loading states, transitions, micro-interactions._

### Responsive Behaviour
| Breakpoint | Layout Change |
|---|---|
| Mobile (< 640px) | |
| Tablet (640–1024px) | |
| Desktop (> 1024px) | |

### Error States
| Error | UI Treatment | Recovery Action |
|---|---|---|
| | | |

### Empty States
| Screen | Empty State Message | CTA |
|---|---|---|
| | | |

---

## 7. Accessibility Requirements
- Keyboard navigation: _describe tab order and shortcuts_
- Screen reader: _ARIA labels and live regions_
- Colour contrast: WCAG 2.1 AA minimum
- Focus management: _describe focus trapping and restoration_

---

## 8. Design System Impact

### New Tokens
| Token | Value | Usage |
|---|---|---|
| | | |

### New Patterns
_Any new reusable patterns this feature introduces._

---

## 9. Performance Targets
| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Bundle impact | < X kB |

---

## 10. Visual Specification
_Wireframes, mockups, or detailed descriptions of each screen state._

### Screen: [Name]
\`\`\`
[ ASCII wireframe or description ]
\`\`\`

---

## Approvals
- [ ] PRISM (Frontend)
- [ ] COMPASS (Product Manager)
- [ ] TITAN (CTO)
- [ ] PROBE (Exploratory Testing)

---
_Generated by Legion Brainstorm Coordinator v2.0. Ref: ${ID}_
`;

const designPath = path.join(ROOT, 'specs', 'design', `${TODAY}-${SLUG}-design-spec.md`);
writeFile(designPath, designSpec);
ok(`Design spec: ${designPath}`);

// ── 6. Test plan ────────────────────────────────────────────────────────────

const testPlan = `# Test Plan
**Feature:** ${FEATURE}
**Author:** AEGIS (QA Engineer)
**Brainstorm Ref:** ${ID}
**Date:** ${TODAY}
**Status:** Draft

---

## 1. Scope
_What is tested. What is out of scope._

---

## 2. Strategy

| Layer | Approach | Tool | Target |
|---|---|---|---|
| Unit | | Vitest | > 80% coverage |
| Integration | | Vitest / Supertest | Core paths |
| E2E | | Playwright | Critical journeys |
| Performance | | k6 | p95 < 200ms |
| Security | | OWASP ZAP | OWASP Top 10 |
| Accessibility | | axe + manual | WCAG 2.1 AA |

---

## 3. Test Cases

### Happy Path
| ID | Scenario | Steps | Expected | Priority |
|---|---|---|---|---|
| TC-001 | | | | P0 |

### Edge Cases
| ID | Scenario | Steps | Expected | Priority |
|---|---|---|---|---|
| TC-010 | | | | P1 |

### Error Cases
| ID | Scenario | Steps | Expected | Priority |
|---|---|---|---|---|
| TC-020 | | | | P0 |

---

## 4. Definition of Done
- [ ] All P0 cases passing
- [ ] Coverage ≥ 80%
- [ ] 0 critical/high security findings
- [ ] Performance targets met
- [ ] Accessibility audit passed
- [ ] CIPHER sign-off
- [ ] LENS code review approved
- [ ] AEGIS QA sign-off

---
_Generated by Legion Brainstorm Coordinator v2.0. Ref: ${ID}_
`;

const testPath = path.join(ROOT, 'specs', 'test-plans', `${TODAY}-${SLUG}-test-plan.md`);
writeFile(testPath, testPlan);
ok(`Test plan: ${testPath}`);

// ── 7. Build backlog ──────────────────────────────────────────────────────────

const tasks: BuildTask[] = [
  { id: 'T001', title: 'Finalise PRD',                   agent: 'product-manager',     priority: 'high',   status: 'open', depends_on: [] },
  { id: 'T002', title: 'Complete Tech Spec',             agent: 'backend',             priority: 'high',   status: 'open', depends_on: ['T001'] },
  { id: 'T003', title: 'Complete Architecture Doc',      agent: 'solutions-architect', priority: 'high',   status: 'open', depends_on: ['T001'] },
  { id: 'T003b', title: 'Complete Design Spec',          agent: 'frontend',            priority: 'high',   status: 'open', depends_on: ['T001'] },
  { id: 'T004', title: 'Security threat model',          agent: 'cyber',               priority: 'high',   status: 'open', depends_on: ['T002', 'T003'] },
  { id: 'T005', title: 'Database schema design',         agent: 'backend',             priority: 'high',   status: 'open', depends_on: ['T002'] },
  { id: 'T006', title: 'Infrastructure plan',            agent: 'cloud',               priority: 'medium', status: 'open', depends_on: ['T003'] },
  { id: 'T007', title: 'CI/CD pipeline setup',           agent: 'devops',              priority: 'medium', status: 'open', depends_on: ['T006'] },
  { id: 'T008', title: 'Backend API implementation',     agent: 'backend',             priority: 'high',   status: 'open', depends_on: ['T002', 'T005'] },
  { id: 'T009', title: 'Frontend implementation',        agent: 'frontend',            priority: 'high',   status: 'open', depends_on: ['T002'] },
  { id: 'T010', title: 'Unit & integration tests',       agent: 'qa',                  priority: 'high',   status: 'open', depends_on: ['T008', 'T009'] },
  { id: 'T011', title: 'E2E tests',                      agent: 'qa',                  priority: 'high',   status: 'open', depends_on: ['T009'] },
  { id: 'T012', title: 'Code review',                    agent: 'reviewer',            priority: 'high',   status: 'open', depends_on: ['T008', 'T009'] },
  { id: 'T013', title: 'Security audit',                 agent: 'cyber',               priority: 'high',   status: 'open', depends_on: ['T008', 'T009'] },
  { id: 'T014', title: 'Exploratory testing',            agent: 'tester',              priority: 'medium', status: 'open', depends_on: ['T009'] },
  { id: 'T015', title: 'Data pipeline (if needed)',      agent: 'data-engineer',       priority: 'medium', status: 'open', depends_on: ['T005'] },
  { id: 'T016', title: 'Analytics & KPI setup',          agent: 'analyst',             priority: 'medium', status: 'open', depends_on: ['T008'] },
  { id: 'T017', title: 'Compliance review',              agent: 'legal-compliance',    priority: 'high',   status: 'open', depends_on: ['T002'] },
  { id: 'T018', title: 'Deployment & release',           agent: 'devops',              priority: 'high',   status: 'open', depends_on: ['T010','T011','T012','T013','T017'] },
  { id: 'T019', title: 'Post-release monitoring',        agent: 'devops',              priority: 'medium', status: 'open', depends_on: ['T018'] },
  { id: 'T020', title: 'Memory sync — update knowledge', agent: 'knowledge',           priority: 'low',    status: 'open', depends_on: ['T018'] },
];

const backlog: BuildBacklog = {
  feature: FEATURE,
  session_id: ID,
  created: TODAY,
  status: 'backlog',
  tasks,
};

const backlogPath = path.join(ROOT, 'build', 'backlog', `${TODAY}-${SLUG}.json`);
writeFile(backlogPath, JSON.stringify(backlog, null, 2));
ok(`Backlog: ${backlogPath}`);

// ── Summary ───────────────────────────────────────────────────────────────────

head('BRAINSTORM COMPLETE');
console.log(`${c.bold}${c.green}`);
console.log(`  Feature:  ${FEATURE}`);
console.log(`  Session:  ${ID}`);
console.log(`  Outputs:`);
console.log(`    ├── brainstorm/sessions/${TODAY}-${SLUG}.md`);
console.log(`    ├── specs/prd/${TODAY}-${SLUG}-prd.md`);
console.log(`    ├── specs/tech/${TODAY}-${SLUG}-tech-spec.md`);
console.log(`    ├── specs/design/${TODAY}-${SLUG}-design-spec.md`);
console.log(`    ├── specs/architecture/${TODAY}-${SLUG}-architecture.md`);
console.log(`    ├── specs/test-plans/${TODAY}-${SLUG}-test-plan.md`);
console.log(`    └── build/backlog/${TODAY}-${SLUG}.json (${tasks.length} tasks)`);
console.log(c.reset);
console.log(`${c.dim}  Fill the brainstorm session first — the specs flow from it.${c.reset}\n`);

// Suppress unused warning for NOW (used in archDoc template context)
void NOW;

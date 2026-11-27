# Legion Technology Radar
**Maintained by:** ORACLE
**Last updated:** 2026-04-12

The Technology Radar tracks Legion's position on technologies across the stack.
Updated quarterly or when significant changes occur.

---

## Adopt
_Proven, battle-tested. Recommended for all new Legion projects._

### Languages & Runtimes
- **TypeScript** — Default for all JS/Node projects. No new JS without types.
- **Python 3.11+** — Data engineering, ML, scripting. Type hints required.
- **Go** — High-throughput services, CLIs, systems programming.

### Frontend
- **Next.js 15 (App Router)** — Default React framework
- **Tailwind CSS** — Utility-first styling. Design token layer on top.
- **Playwright** — E2E testing. Playwright over Cypress for new projects.
- **Vitest** — Unit testing for TypeScript projects. Replaces Jest.

### Backend
- **PostgreSQL** — Default relational database
- **Redis** — Caching, queues, pub/sub
- **Clerk** — Managed authentication (as of ADR-001)

### Infrastructure
- **Terraform** — All infrastructure as code
- **Docker + Kubernetes** — Container orchestration at scale
- **GitHub Actions** — CI/CD pipelines

---

## Trial
_Worth using on projects where it fits. Evaluate carefully._

- **Bun** — Fast JS runtime. Promising but not production-proven at scale for us yet.
- **Drizzle ORM** — Lighter than Prisma, TypeScript-first. Trial on new projects.
- **tRPC** — Type-safe APIs for monorepo full-stack projects.
- **Temporal** — Durable workflow orchestration. Evaluating for complex async flows.
- **Turso** — SQLite at the edge. Interesting for specific edge use cases.

---

## Assess
_Interesting. Monitor closely. Not ready for production yet._

- **Deno 2** — Node.js alternative. Improving rapidly. Watch.
- **Solid.js** — High-performance React alternative. Niche but impressive.
- **HTMX** — Server-side rendering revival. Relevant for certain project types.
- **Wasm** — Web Assembly in the backend. Maturing fast.
- **AI/LLM integration patterns** — Evolving rapidly. Assess per project.

---

## Hold
_Do not start new work with these technologies._

- **Create React App** — Dead. Use Vite or Next.js.
- **Webpack 4** — Upgrade to 5 or switch to Vite.
- **REST without OpenAPI spec** — All REST APIs must have a spec.
- **jQuery** — No new jQuery in any project.
- **Class-based React components** — Hooks only for new code.
- **MongoDB for relational data** — PostgreSQL handles documents too (JSONB).
- **Self-hosted auth** — Use a managed provider (see ADR-001).

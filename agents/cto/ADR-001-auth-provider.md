# ADR-001 — Authentication Provider Selection

**Date:** 2026-04-12
**Status:** Accepted
**Decider:** TITAN
**Consulted:** CIPHER, FORGE, COMPASS, SHIELD
**Project:** Example Corp — Phase 1

---

## Context

Example Corp requires a modern authentication system supporting email/password,
Google OAuth, and SAML SSO for enterprise clients. The decision is whether to
build a custom auth system, use an open-source solution, or use a managed auth provider.

---

## Decision

Use **Clerk** as the managed authentication provider, wrapped by a thin backend
service layer that syncs auth events to our PostgreSQL database.

---

## Alternatives Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Custom auth | Full control, no vendor lock-in | 6-8 weeks to build properly, ongoing maintenance, high security risk | Rejected |
| Auth0 | Mature, enterprise-ready | Expensive at scale, complex pricing, over-engineered for our needs | Rejected |
| Supabase Auth | Open source, self-hostable | Less mature SSO support, limited MFA options | Rejected |
| Clerk | Great DX, built-in SSO, MFA, generous pricing, easy migration | Vendor dependency | **Accepted** |
| NextAuth.js | Open source, free | Requires significant custom work for SSO, session management complexity | Rejected |

---

## Consequences

**Positive:**
- Authentication delivered in days not weeks
- MFA, SSO, brute force protection built in — not our problem to solve
- Clerk handles compliance (SOC2, GDPR) for auth data
- Easy to migrate away if needed — we own the user IDs in our DB

**Negative:**
- Monthly cost scales with users (~$0.02/MAU on Pro plan)
- Vendor dependency — Clerk outage = auth outage (mitigated by Clerk's 99.99% SLA)
- Limited customisation of certain auth flows

## Review Date

Reconsider at 100,000 MAU — evaluate if self-hosting Clerk or switching to custom auth is justified by cost savings.

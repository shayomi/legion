# Brainstorm Session — User Authentication System
**Session ID:** bs_example_001
**Date:** 2026-04-12
**Feature:** Secure user authentication with SSO support

---

## Problem Statement
New client requires user authentication that supports both email/password login
and enterprise SSO (SAML, OIDC). Must be production-ready, GDPR compliant,
and handle 50,000 DAU from day one.

---

## Agent Perspectives

### CTO (TITAN) — Strategic & Architecture View
- Use an established auth provider (Auth0, Clerk, Supabase Auth) rather than rolling our own — the liability and maintenance burden of custom auth is not justified at this stage
- If SSO is enterprise-only, gate it behind a feature flag tied to the enterprise plan
- JWT with short expiry (15min) + refresh token rotation — no long-lived tokens
- All auth events (login, logout, failed attempt, password reset) must be auditable

**Chosen approach:** Clerk for auth provider — handles email, SSO, MFA out of the box. Wrap in our own auth service layer so we can swap providers later.

### Product Manager (COMPASS) — Product & User View
- Primary users: end users (consumer login) + enterprise IT admins (SSO setup)
- MVP: email/password + Google OAuth. V2: SAML SSO for enterprise
- Success metric: < 3% of users experience auth issues per week
- Risk: SSO setup complexity for enterprise IT admins — needs solid documentation and onboarding flow

### Frontend (PRISM) — UI/UX View
- Login, signup, forgot password, reset password flows
- Magic link option for passwordless — reduces friction significantly
- SSO button displayed only when domain is recognised (domain-based routing)
- Error states must be specific enough to be helpful but vague enough not to leak info ("Invalid credentials" not "Email not found")
- Accessibility: full keyboard navigation, screen reader compatible

### Backend (FORGE) — API & Data View
- Auth service as a separate module — clean boundary from business logic
- `/api/auth/*` routes — Clerk webhooks to sync user state to our DB
- User record in our DB is minimal: id, clerk_id, email, plan, created_at
- Never store passwords ourselves — fully delegated to Clerk
- Rate limiting on all auth endpoints: 5 attempts per minute per IP

### Cloud (STRATUS) — Infrastructure View
- Auth endpoints behind WAF — extra protection against brute force
- Clerk runs on their infrastructure — no auth servers for us to manage
- Our user DB on RDS PostgreSQL, auth data stays in Clerk
- Rate limiting at edge (Cloudfront WAF rules)

### Cyber (CIPHER) — Security View
- Agreed: do not roll custom auth. Third-party auth provider is the right call.
- OWASP requirements to verify on chosen provider: MFA support ✓, brute force protection ✓, secure session management ✓
- Refresh token rotation must be enforced — Clerk supports this
- All auth events logged and queryable for incident response
- GDPR: user deletion must propagate to Clerk via webhook

### QA (AEGIS) — Quality View
- Test matrix: email/password, Google OAuth, SAML (when built), magic link
- Security test: brute force protection, token expiry, logout on all devices
- E2E: full signup → login → password reset → account deletion flow
- Performance: login endpoint p95 < 100ms
- Edge cases: expired tokens, invalid SSO config, concurrent sessions

---

## Key Decisions

| Decision | Options Considered | Chosen | Rationale |
|---|---|---|---|
| Auth provider | Roll our own, Auth0, Clerk, Supabase Auth | Clerk | Best DX, SSO support, generous free tier, easy migration path |
| Token strategy | Long-lived JWTs, Session cookies, Short JWT + refresh | Short JWT (15min) + refresh token rotation | Balance of security and UX |
| SSO timeline | MVP, V2, Never | V2 (post-launch) | Not enough enterprise clients yet to justify MVP scope |
| Domain recognition | Manual entry, DNS lookup, Email domain match | Email domain match | Simplest, most reliable |

---

## Open Questions

- [x] Which Clerk plan covers our expected user volume? → Pro plan, ~$25/mo for 10k MAU
- [ ] Do we need MFA on MVP or V2? → Ask client
- [ ] What is the session timeout requirement? → Default 7 days, configurable

---

## Agreed Approach

Use Clerk as auth provider. Our backend wraps Clerk webhooks to sync minimal user
state to our PostgreSQL DB. Frontend uses Clerk's pre-built components, customised
to match our design system. SAML SSO deferred to V2.

---

## Next Steps

| Action | Owner | Deadline |
|---|---|---|
| Write PRD | COMPASS | 2026-04-13 |
| Write Tech Spec | FORGE | 2026-04-14 |
| Clerk account setup + API keys | CONDUIT | 2026-04-13 |
| Security review of Clerk | CIPHER | 2026-04-14 |
| Frontend auth component plan | PRISM | 2026-04-14 |

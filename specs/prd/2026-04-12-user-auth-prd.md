# Product Requirements Document — User Authentication
**Author:** COMPASS
**Brainstorm Ref:** bs_example_001
**Date:** 2026-04-12
**Status:** Draft

---

## 1. Overview

### Problem
The platform has no user authentication. Users cannot create accounts, log in,
or have any persistent identity. This blocks all personalisation, billing,
and enterprise features.

### Solution
Implement a complete authentication system using Clerk as the auth provider,
supporting email/password and Google OAuth at launch, with SAML SSO in V2.

### Success Metrics
| Metric | Baseline | Target |
|---|---|---|
| Auth error rate | N/A | < 3% of sessions |
| Login completion rate | N/A | > 92% |
| Signup completion rate | N/A | > 75% |
| p95 login latency | N/A | < 100ms |

---

## 2. Users & Use Cases

### Primary Users
- **End users** — creating accounts, logging in daily
- **Enterprise IT admins** — configuring SSO for their organisation (V2)

### User Stories
- As a **new user**, I want to sign up with my email so I can create an account.
- As a **returning user**, I want to log in with Google so I don't need to remember a password.
- As a **user who forgot their password**, I want to reset it via email so I can regain access.
- As an **enterprise admin (V2)**, I want to configure SAML SSO so my team logs in via our identity provider.

### Out of Scope (this release)
- SAML/OIDC SSO (V2)
- MFA enforcement (V2)
- Admin user management console
- Social logins beyond Google

---

## 3. Feature Requirements

### Must Have (P0)
- [x] Email + password signup and login
- [x] Google OAuth login
- [x] Forgot password → email reset flow
- [x] Session management with secure token refresh
- [x] Logout (current device and all devices)
- [x] GDPR-compliant account deletion

### Should Have (P1)
- [ ] Magic link (passwordless) login option
- [ ] "Remember me" option
- [ ] Login attempt rate limiting visible to user ("Too many attempts, try in 5 minutes")

### Nice to Have (P2)
- [ ] Login activity log visible to user
- [ ] Trusted device management

---

## 4. UX Requirements

- Error messages must be helpful but not leak whether an email exists in the system
- All flows must be fully keyboard navigable
- All flows must pass WCAG 2.1 AA accessibility audit
- Clerk pre-built components used as base, reskinned to match design system
- Mobile-first responsive design

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Login p95 latency | < 100ms |
| Uptime (auth endpoints) | 99.9% |
| Auth data residency | EU (GDPR) |
| Token expiry | 15 min access, 7 day refresh |
| Password minimum | 8 chars, 1 uppercase, 1 number |

---

## 6. Approvals
- [ ] COMPASS (author)
- [ ] TITAN (technical feasibility)
- [ ] CIPHER (security sign-off)
- [ ] SHIELD (GDPR compliance)
- [ ] Legion (principal approval)

# Technical Specification — User Authentication
**Author:** FORGE + TITAN
**PRD Ref:** specs/prd/2026-04-12-user-auth-prd.md
**Brainstorm Ref:** bs_example_001
**Date:** 2026-04-12
**Status:** Draft

---

## 1. Technical Overview

Authentication is handled by Clerk. Our backend wraps Clerk via webhooks to maintain
a minimal user record in our own PostgreSQL database. Our frontend uses Clerk's
React SDK with custom styling. We never store or handle passwords directly.

---

## 2. System Context

```
Browser (PRISM)
  └── Clerk JS SDK (handles auth UI + token management)
        └── Clerk Cloud (auth provider — identity, sessions, MFA)
              └── Webhook → Our Backend (FORGE)
                    └── PostgreSQL (minimal user record)
```

---

## 3. API Design

### Webhook endpoint (Clerk → our backend)
**POST** `/api/webhooks/clerk`
Receives: `user.created`, `user.updated`, `user.deleted` events
Auth: Clerk webhook signature (verified via `svix`)

### User endpoint (our API)
**GET** `/api/users/me`
Auth: Clerk JWT (verified via Clerk middleware)
Returns our extended user record (plan, preferences, etc.)

---

## 4. Data Model

```sql
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  plan        TEXT NOT NULL DEFAULT 'free',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## 5. Frontend Implementation (PRISM)

- `@clerk/nextjs` SDK installed
- `<ClerkProvider>` wraps the app in `layout.tsx`
- `<SignIn />`, `<SignUp />` components used — customised via Clerk appearance API
- `useAuth()` hook for auth state throughout the app
- `middleware.ts` protects all routes under `/dashboard/*`

---

## 6. Security (CIPHER sign-off required)

- JWT expiry: 15 minutes
- Refresh token rotation: enabled in Clerk dashboard
- Rate limiting: Clerk built-in + Cloudfront WAF rule (5 req/min/IP on auth paths)
- Webhook verification: `svix` library validates all incoming Clerk webhooks
- Account deletion: user.deleted webhook triggers immediate data purge from our DB

---

## 7. Migration Plan

1. Deploy Clerk SDK and webhook endpoint (dark — no UI yet)
2. PRISM ships auth pages behind feature flag
3. Existing test accounts migrated manually (< 20 accounts, pre-launch)
4. Feature flag enabled for all users
5. Monitor error rates for 48 hours
6. Rollback: disable Clerk provider, restore previous auth state

---

## Approvals
- [ ] TITAN
- [ ] LENS (code review)
- [ ] CIPHER (security)

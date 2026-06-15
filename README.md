# GigKraft

Production monorepo for the GigKraft platform: a multi-node marketplace
connecting service professionals (pros) and homeowners, coordinated by node
managers.

## Repository Layout

```
prod/
  backend/    Django + Django Ninja + PostgreSQL API
  frontend/   React + Vite + TypeScript + Mantine web app (node manager console)
  mobile/     Expo + React Native + TypeScript app (one app, role-based flows)
```

Supporting infrastructure (PostgreSQL, Redis) runs via local `docker-compose`
only for the MVP. There is no cloud deployment target yet.

## Architecture Overview

- **Auth:** JWT (access + refresh) with a single `User` model carrying a role:
  `pro`, `homeowner`, or `node_manager`.
  - Pros and homeowners authenticate via phone OTP (mocked in MVP).
  - Node managers authenticate via Google sign-in or email/password.
- **Mobile:** one Expo app for all roles; routing and screens are gated by the
  authenticated user's role.
- **Service area (MVP):** pros define coverage with a ZIP code list plus a
  radius slider. There is no map UI in the MVP.
- **Geography:** multi-node support is built in from the start.
- **Realtime (MVP):** polling. WebSockets are deferred to Phase 2+.
- **Integrations:** Twilio (SMS/WhatsApp/OTP), Stripe, S3, FCM, and Google
  OAuth are all mocked in Phase 1 and wired live in Phase 2.
- **Out of MVP scope:** homeowner billing/payments.

## Phase Plan

| Phase | Scope |
| ----- | ----- |
| Phase 1 | Backend + frontend + mobile with mocked integrations |
| Phase 2 | Live integrations: Twilio, Stripe, S3, FCM, Google OAuth |

Milestone tracking lives in `dev/requirements/Initial Setup/01.Basic Structure`.

## Quickstart (placeholders)

Prerequisites: Docker Desktop, Python 3.12+, Node 20+, and the Expo CLI.

1. Copy env templates:

```
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp mobile/.env.example mobile/.env
```

2. Start infrastructure (and, once scaffolded, the apps):

```
docker compose up -d
```

3. Per-app dev servers: see the README in each app folder. App scaffolds land
   in Milestones 2-4; until then the compose services are placeholders.

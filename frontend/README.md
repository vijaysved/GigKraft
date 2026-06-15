# GigKraft Frontend

React + Vite + TypeScript + Mantine web app for node managers (admin console).
Scaffolded in Milestone 3.

Auth via Google sign-in (mocked in Phase 1) or email/password against the
backend JWT API.

## What is here (Milestone 3)

- Vite + React + TypeScript scaffold with Mantine UI and React Router.
- Theme system with 4 themes (3 light + 1 dark), selectable from the header
  and persisted in localStorage:
  - `gigkraft_light` (indigo), `warm_light` (orange), `cool_light` (teal),
    `gigkraft_dark` (violet, dark scheme).
- Node manager auth shell:
  - Email/password login against `POST /api/auth/login`.
  - Google sign-in (Phase 1 mock): sends `mock-google:<email>` to
    `POST /api/auth/google`; the backend creates the node manager on first
    sign-in when `MOCK_GOOGLE_OAUTH=true`.
  - JWT storage in localStorage with refresh-on-load and a route guard
    around the protected area.
- Typed API client generated from the backend OpenAPI schema
  (`openapi-typescript` + `openapi-fetch`), with wrappers for
  health/auth/me in `src/api/endpoints.ts`.
- Protected dashboard page showing the signed-in profile and backend
  health/mock status.

Admin triage and Kraft verification screens land in Milestone 5.
Realtime stays polling-based in MVP (no WebSockets yet).

## Local Development

```
cp .env.example .env
npm install
npm run generate:api   # regenerate src/api/generated/types.ts from
                       # ../backend/openapi/openapi.json
npm run dev            # http://localhost:5173
```

The backend must be running on http://localhost:8000 (see
`prod/backend/README.md`). Sign in either by registering a user via the
backend API or by using the mock Google button with any email.

## Scripts

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the Vite dev server.                       |
| `npm run build`        | Typecheck (project refs) and produce a build.    |
| `npm run typecheck`    | Typecheck only, no emit.                         |
| `npm run lint`         | ESLint over the source tree.                     |
| `npm run preview`      | Serve the production build locally.              |
| `npm run generate:api` | Regenerate API types from the backend OpenAPI.   |

Regenerate the API types whenever the backend schema changes (the backend
exports it to `prod/backend/openapi/openapi.json`).

## Structure

```
src/
  api/        generated types, openapi-fetch client, typed endpoint wrappers
  auth/       AuthContext (JWT session) and RequireAuth route guard
  layout/     AppShell layout with header, theme selector, sign-out
  pages/      LoginPage, DashboardPage
  theme/      4 named Mantine themes, ThemeProvider (localStorage), selector
```

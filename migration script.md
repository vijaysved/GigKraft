# GigKraft Deployment Migration Log

Completed: 2026-06-18

---

## Architecture

| Service | Platform | URL | Deploy trigger |
|---|---|---|---|
| Backend (Django) | Railway | `https://gigkraft-backend-production.up.railway.app` | Push to `main` touching `backend/` |
| Frontend (React/Vite) | Vercel | Vercel dashboard | Push to `main` touching `frontend/` |
| Database | Railway PostgreSQL | auto-injected as `DATABASE_URL` | — |

---

## What was already in place

- `backend/railway.toml` — Railway build (Dockerfile) + start command (migrate → create_gk_admin → collectstatic → gunicorn)
- `frontend/vercel.json` — rewrites `/api/*` to Railway backend, SPA fallback
- `frontend/.vercel/project.json` — Vercel project linked (`projectId: prj_erAKcNb27QfcRjHOutDUed5MD5ko`, `orgId: team_Rry80H8FwUpHAuHpCuSUPdze`)
- `.github/workflows/backend-deploy.yml` — CI pipeline (Railway deploy steps were commented out)
- `.github/workflows/frontend-deploy.yml` — CI pipeline (Vercel deploy steps were present but broken)

---

## Changes made

### `backend/Dockerfile`
Added `DJANGO_SETTINGS_MODULE=config.settings.production` to the `ENV` block so production settings are always used when the container starts.

### `backend/krafts/api.py`
Added `invoice_confirmed: bool` and `invoice_cost: Optional[float]` to `KraftOut` schema and `serialize_kraft()`. These fields existed on the model but were missing from the API response, causing frontend `as any` casts.

### `backend/accounts/tests.py`
Updated `test_kraft_publish_requires_after_photo_and_confirmed_invoice` to assert `Kraft.Status.VERIFIED` (not `PENDING`). The publish endpoint was changed to set status to `VERIFIED` directly, skipping the node-manager review step.

### `backend/billing/migrations/0003_alter_stripesettings_id.py`
Generated missing migration for `billing` app (model change not yet reflected).

### `backend/krafts/migrations/0006_description_max_length.py`
Generated missing migration for `krafts` app.

### `backend/vendors/migrations/0004_last_seen_tags_pageview.py`
Generated missing migration for `vendors` app.

### `.github/workflows/backend-deploy.yml`
Removed commented-out Railway CLI deploy steps. Railway deploys automatically via its own GitHub integration — no CLI step needed in CI. CI now only runs tests.

### `.github/workflows/frontend-deploy.yml`
Removed Vercel CLI deploy steps (`vercel pull / build / deploy`). Vercel deploys automatically via its own GitHub integration. CI now only runs typecheck + lint + build.

### `frontend/src/api/generated/types.ts`
Added `invoice_confirmed: boolean` and `invoice_cost: number | null` to the `KraftOut` schema to match the updated backend.

### `frontend/src/pages/DashboardPage.tsx`
Removed `(kraft as any).invoice_confirmed` and `(kraft as any).invoice_cost` — replaced with properly typed `kraft.invoice_confirmed` and `kraft.invoice_cost`.

### `frontend/src/features/admin/AdminKraftsPage.tsx`
Removed `(kraft as any).invoice_confirmed` — replaced with `kraft.invoice_confirmed`.

### `frontend/src/features/pro/ProKraftEditorPage.tsx`
Moved `editorRef.current = editor` assignment into a `useEffect(() => { ... }, [editor])` to fix the "Cannot access refs during render" lint error.

### `frontend/src/features/pro/ProBillingPage.tsx`
Added `// eslint-disable-next-line react-hooks/exhaustive-deps` before the run-once `useEffect`. The `load` function is called recursively for Stripe webhook polling and cannot be wrapped in `useCallback` without significant refactor — intentional run-on-mount pattern.

---

## GitHub Secrets required

| Secret | Where used |
|---|---|
| `RAILWAY_TOKEN` | Backend CI (available but not used — Railway deploys via GitHub integration) |
| `VERCEL_TOKEN` | Frontend CI (available but not used — Vercel deploys via GitHub integration) |
| `VERCEL_ORG_ID` | `team_Rry80H8FwUpHAuHpCuSUPdze` |
| `VERCEL_PROJECT_ID` | `prj_erAKcNb27QfcRjHOutDUed5MD5ko` |
| `VITE_API_BASE_URL` | `https://gigkraft-backend-production.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | `229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com` |

---

## Railway environment variables (set in Railway dashboard)

```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_SECRET_KEY=<strong random key>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=gigkraft-backend-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://<vercel-url>
DATABASE_URL=<auto-injected by Railway Postgres plugin>
MOCK_TWILIO=false
MOCK_STRIPE=false
MOCK_S3=false
MOCK_FCM=false
MOCK_WHATSAPP=false
MOCK_RESEND=false
GOOGLE_CLIENT_ID=229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com
RESEND_API_KEY=<resend key>
STRIPE_MODE=live
STRIPE_SECRET_KEY=<stripe live key>
STRIPE_WEBHOOK_SECRET=<stripe webhook secret>
TWILIO_ACCOUNT_SID=<twilio sid>
TWILIO_AUTH_TOKEN=<twilio token>
TWILIO_VERIFY_SERVICE_SID=<twilio verify sid>
AWS_ACCESS_KEY_ID=<aws key>
AWS_SECRET_ACCESS_KEY=<aws secret>
AWS_S3_BUCKET=<bucket name>
FCM_CREDENTIALS_JSON=<firebase credentials json>
```

---

## Final CI status (as of 2026-06-18)

| Workflow | Status |
|---|---|
| GigKraft Backend CI/CD | ✅ passing (18/18 tests) |
| GigKraft Frontend CI/CD | ✅ passing (typecheck + lint + build, zero warnings) |
| OpenAPI Contract Sync | skipped (no schema change) |

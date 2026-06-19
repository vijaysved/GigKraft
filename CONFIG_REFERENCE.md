# GigKraft Configuration Reference

Complete reference for all environment variables, secrets, and platform settings required to run GigKraft in production.

---

## Architecture

```
Browser (gigkraft.com)
    └── Vercel (frontend)
            └── calls Railway API directly (cross-origin, CORS required)
                    └── Railway (Django backend)
```

> The Vercel `/api/*` rewrite in `vercel.json` is retained as a fallback but is NOT used in production. The frontend calls Railway directly via `VITE_API_BASE_URL`.

---

## Google OAuth

| | Client ID |
|---|---|
| **DEV** | `83848902207-98do9lnkr0d3t7vii3ufc408lbuunr7a.apps.googleusercontent.com` |
| **PROD** | `229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com` |

**Google Cloud Console — authorized JavaScript origins (PROD client):**
- `https://gigkraft.com`
- `https://www.gigkraft.com`

**Google Cloud Console — authorized JavaScript origins (DEV client):**
- `http://localhost:5173`
- `http://127.0.0.1:5173`

---

## Railway — Backend Environment Variables

Set these in the Railway dashboard → GigKraft backend service → Variables.

| Variable | Value |
|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `DJANGO_SECRET_KEY` | *(long random string — never commit)* |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ALLOWED_HOSTS` | `gigkraft-backend-production.up.railway.app` |
| `DATABASE_URL` | *(injected automatically by Railway Postgres)* |
| `REDIS_URL` | *(injected automatically by Railway Redis, if used)* |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173,https://gigkraft.com,https://www.gigkraft.com,https://frontend-gigkraft.vercel.app,https://gigkraft.vercel.app` |
| `GOOGLE_CLIENT_ID` | `229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com` *(PROD)* |
| `STRIPE_MODE` | `live` |
| `STRIPE_SECRET_KEY` | *(live secret key from Stripe dashboard)* |
| `STRIPE_WEBHOOK_SECRET` | *(from Stripe webhook endpoint)* |
| `RESEND_API_KEY` | *(from Resend dashboard)* |
| `MOCK_TWILIO` | `false` |
| `MOCK_STRIPE` | `false` |
| `MOCK_S3` | `false` |
| `MOCK_FCM` | `false` |
| `MOCK_WHATSAPP` | `false` |
| `MOCK_RESEND` | `false` |

---

## Vercel — Frontend Environment Variables

Set these in the Vercel dashboard → GigKraft project → Settings → Environment Variables → Production.

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://gigkraft-backend-production.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | `229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com` *(PROD)* |
| `VITE_STRIPE_LIVE_PRICING_TABLE_ID` | *(from Stripe dashboard)* |
| `VITE_STRIPE_LIVE_PUBLISHABLE_KEY` | *(from Stripe dashboard)* |

---

## GitHub Actions Secrets

Set these in GitHub → repo Settings → Secrets and variables → Actions.

These are only used for CI **validation** builds. The actual production bundle is built by Vercel using the Vercel env vars above.

| Secret | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://gigkraft-backend-production.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | `229054869565-j3hgo5sosgmetasc2ar98s1b0ah65q0m.apps.googleusercontent.com` *(PROD)* |

---

## Local Development — `frontend/.env`

```
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=83848902207-98do9lnkr0d3t7vii3ufc408lbuunr7a.apps.googleusercontent.com
VITE_STRIPE_TEST_PRICING_TABLE_ID=prctbl_1TiiAsLX1gZ3bErSx6KGaPZG
VITE_STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...
```

## Local Development — `backend/.env`

```
DEBUG=true
GOOGLE_CLIENT_ID=83848902207-98do9lnkr0d3t7vii3ufc408lbuunr7a.apps.googleusercontent.com
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MOCK_TWILIO=true
MOCK_STRIPE=true
MOCK_S3=true
MOCK_FCM=true
MOCK_WHATSAPP=true
MOCK_RESEND=false
```

---

## Django Production Settings — Key Gotchas

All in `backend/config/settings/production.py` and `base.py`:

| Setting | Value | Why |
|---|---|---|
| `SECURE_PROXY_SSL_HEADER` | `("HTTP_X_FORWARDED_PROTO", "https")` | Railway terminates SSL at its proxy edge. Without this, Django sees plain HTTP from the proxy, thinks it needs to redirect to HTTPS, and enters an infinite 301 loop. |
| `SECURE_SSL_REDIRECT` | `True` | Enforces HTTPS — only works correctly when `SECURE_PROXY_SSL_HEADER` is also set. |
| `APPEND_SLASH` | `False` | This is a pure API backend. Django's default `True` causes `CommonMiddleware` to redirect OPTIONS preflight requests to add a trailing slash, which browsers reject as "Redirect is not allowed for a preflight request." |
| `CORS_ALLOWED_ORIGINS` | *(from env var)* | Must include all origins the frontend is served from. Use commas only — no semicolons. |

---

## URLs

| Service | URL |
|---|---|
| Frontend (production) | `https://www.gigkraft.com` |
| Backend (production) | `https://gigkraft-backend-production.up.railway.app` |
| Backend API docs | `https://gigkraft-backend-production.up.railway.app/api/docs` |
| Frontend (Vercel raw) | `https://frontend-gigkraft.vercel.app` |

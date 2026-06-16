# GigKraft Backend

Django 5.2 + Django Ninja + PostgreSQL API (Milestone 2: scaffolded).

## Responsibilities

- Single `User` model (`accounts.User`, wired via `AUTH_USER_MODEL`) with
  role: `pro`, `homeowner`, `node_manager`.
- JWT auth (stateless access + refresh tokens, PyJWT/HS256).
  - Pros/homeowners: phone OTP (mocked in Phase 1).
  - Node managers: Google sign-in (mocked in Phase 1) + email/password.
- Node-aware domain models (`nodes.Node`; users carry an optional node FK).
- ZIP list + radius service-area model for pros (no map/geo UI dependency):
  `accounts.ProProfile.service_zips` + `service_radius_miles` + `base_zip`.
- OpenAPI docs at `/api/docs` with typed schema export for clients.
- Integrations behind mock adapters in Phase 1 (env-flagged): Twilio
  (OTP/SMS/WhatsApp), Stripe, S3, FCM, Google OAuth.

## Layout

```
backend/
  manage.py
  requirements.txt
  config/            # project: settings/ (base, local), urls, api (NinjaAPI)
  accounts/          # User, ProProfile, HomeownerProfile, JWT, auth API
  nodes/             # Node model
  common/            # health endpoint, export_openapi management command
```

## Local Development

```
cd prod/backend
cp .env.example .env

python -m venv .venv
.venv/Scripts/activate          # Windows (use source .venv/bin/activate elsewhere)
pip install -r requirements.txt

# Start infra (optional: without it, sqlite fallback is used automatically)
docker compose -f ../docker-compose.yml up -d postgres redis

python manage.py migrate
python manage.py runserver
```

Notes:

- `DATABASE_URL` in `.env` points at the compose PostgreSQL. If postgres is
  not running and `DATABASE_URL` is removed/blank, settings fall back to a
  local `db.sqlite3` so the API still runs.
- Or run everything in compose: `cd prod && docker compose up -d` (requires
  `backend/.env` to exist; the compose file overrides DB/Redis hostnames).

## API Surface (Milestone 2)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | none | liveness + mock-flag report |
| GET | `/api/docs` | none | interactive OpenAPI docs |
| POST | `/api/auth/register` | none | email/password, any role |
| POST | `/api/auth/login` | none | email/password |
| POST | `/api/auth/refresh` | none | refresh -> new access token |
| POST | `/api/auth/otp/request` | none | phone OTP (MOCK: returns `dev_code`) |
| POST | `/api/auth/otp/verify` | none | OTP sign-in, creates pro/homeowner |
| POST | `/api/auth/google` | none | Google sign-in (MOCK: `mock-google:<email>`) |
| GET | `/api/me` | Bearer JWT | sample protected endpoint |

### Mock behavior (Phase 1)

Controlled by env flags (see `.env.example`); deterministic by design:

- `MOCK_TWILIO=true`: OTP code is always `MOCK_OTP_CODE` (default `123456`)
  and `/api/auth/otp/request` echoes it back as `dev_code`.
- Google OAuth (`/api/auth/google`) uses real Google token verification via
  `google-auth` library — no mock mode; pass a valid `id_token` from the client.

### Quick smoke (PowerShell)

```
Invoke-RestMethod http://localhost:8000/api/health

$r = Invoke-RestMethod -Method Post http://localhost:8000/api/auth/register `
  -ContentType application/json `
  -Body '{"email":"mgr@gigkraft.dev","password":"s3curePass!","role":"node_manager"}'
Invoke-RestMethod http://localhost:8000/api/me -Headers @{Authorization="Bearer $($r.access)"}
```

## OpenAPI Export (typed clients)

```
python manage.py export_openapi                  # writes openapi/openapi.json
python manage.py export_openapi --output path.json
```

Frontend/mobile can generate typed clients from the exported schema, e.g.:

```
npx openapi-typescript prod/backend/openapi/openapi.json -o src/types/api.d.ts
```

## Tests and Checks

```
python manage.py check
python manage.py test          # auth/health smoke tests (sqlite)
```

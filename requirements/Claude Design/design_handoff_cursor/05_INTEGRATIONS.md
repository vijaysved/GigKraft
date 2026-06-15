# 05 · Integrations — Twilio · Stripe · S3 · FCM · Google · AWS

Concrete wiring for the third-party services chosen with the product owner. All secrets live in the **backend**; the apps only ever talk to your Django Ninja API (except Stripe Checkout/Elements and Google sign-in SDKs, which are client-side by design).

---

## 1. Twilio — SMS + WhatsApp (emergency dispatch + OTP)

Used by: **2.3 Emergency Broadcast** (fan-out), **1.1 Auth** (phone OTP), lead/quote SMS alerts.

- **Phone OTP:** use **Twilio Verify** (`/api/auth/otp/request` → start verification; `/api/auth/otp/verify` → check code). Don't roll your own code store.
- **Broadcast fan-out:** on `POST /api/emergencies`, if `node.auto_blast`, create `BroadcastDispatch` rows for eligible pros (matching trade + in ZIP range + `notif_pref.whatsapp_dispatch`), then send:
  - **WhatsApp** via Twilio (`from='whatsapp:+…'`, pre-approved template message).
  - **SMS** via Twilio Messaging Service.
- **Claims:** include a short link; first pro to claim hits `/api/emergencies/{id}/claim`, which sets `claimed_by`, opens a `Lead` + chat, and stops further escalation. Unclaimed past `node.escalation_minutes` → surface in admin **3.2 Triage**.
- Run sends in a worker (**Celery + Redis**, or Django-Q) — never block the request.

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=     # Twilio Verify
TWILIO_MESSAGING_SERVICE_SID=  # SMS
TWILIO_WHATSAPP_FROM=whatsapp:+1...
```

---

## 2. Stripe — pro subscription ("Vault", 1.12)

Plan: **$19.99/mo** or **$199/yr**. Create two Prices on one Product.

- **Checkout:** mobile opens Stripe Checkout (or `@stripe/stripe-react-native` Payment Sheet) for the chosen Price; backend creates the Customer + Subscription and stores `stripe_customer_id` / `stripe_subscription_id` on `Subscription`.
- **Coupons:** the 1.12 coupon field maps to Stripe promotion codes (`POST /api/billing/coupon`).
- **Source of truth = webhooks.** `POST /api/billing/webhook` handles `customer.subscription.updated/deleted`, `invoice.paid`, `invoice.payment_failed` → update `Subscription.status` / `renews_at` / `card_last4` and the billing history list. Verify the signature.
- A pro must have `subscription.status == 'active'` to publish Krafts / claim leads (gate server-side).

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PUBLISHABLE_KEY=        # ship to clients
```

---

## 3. AWS S3 — photo & invoice storage

Used by: Kraft before/after photos (1.6), recommendation photos (2.5), profile/wallpaper (1.3), license/COI PDFs (1.4).

- **Presigned uploads.** Client asks `POST /api/media/presign` `{kind, content_type}` → backend returns a presigned `PUT` URL + the final object URL. Client uploads **directly to S3**, then sends the object URL back with the create/patch call (e.g. `KraftPhoto.image_url`). Keeps large files off your API.
- Private bucket; serve via **CloudFront** signed URLs (or presigned GETs). Validate `content_type` + size server-side; reject the publish if the After photo URL isn't a verified object in your bucket.
- Use `django-storages` for any server-side writes (CSV exports, etc.).

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=gigkraft-media
AWS_S3_REGION=us-west-2
AWS_CLOUDFRONT_DOMAIN=
```

---

## 4. Firebase Cloud Messaging — push

Used by: lead claims, quote updates, new broadcast nearby, recommendation approved.

- RN registers a device token (`@react-native-firebase/messaging` or Expo `getDevicePushTokenAsync`) → `POST /api/me/device-tokens`. Store in `DeviceToken`.
- Backend sends via the **Firebase Admin SDK** (server key) from the same worker that handles dispatch. Respect `NotificationPref` (`sms_alerts`, etc.) per channel.
- iOS needs an APNs key uploaded to Firebase; Android uses the FCM sender automatically.

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
# client: google-services.json (Android) + GoogleService-Info.plist (iOS)
```

---

## 5. Google sign-in

- **Mobile:** `@react-native-google-signin/google-signin` → obtain a Google **ID token** → `POST /api/auth/google` → backend verifies the token (`google-auth` lib) against `GOOGLE_OAUTH_CLIENT_ID`, then `get_or_create`s the `User` and returns your own session/JWT.
- **Web admin:** managers can use Google too (same endpoint) or email/password.
- Also supported: **email + password** (`/api/auth/register`, `/api/auth/login`) and **phone OTP** (via Twilio Verify, §1).

```
GOOGLE_OAUTH_CLIENT_ID=        # web + per-platform client IDs
GOOGLE_OAUTH_CLIENT_SECRET=
```

---

## 6. AWS deploy (backend)

Sensible default — adjust to taste:

- **API:** Django (ASGI via Uvicorn/Gunicorn) on **ECS Fargate** (or Elastic Beanstalk / App Runner for simplicity) behind an ALB.
- **DB:** **RDS PostgreSQL**. **Cache/broker:** **ElastiCache Redis** (Celery).
- **Worker:** a second Fargate service running Celery for Twilio/FCM/Stripe-retry jobs.
- **Static/media:** S3 + CloudFront (§3). **Secrets:** AWS Secrets Manager / SSM Parameter Store — not in the repo.
- **Web admin:** static Vite build → S3 + CloudFront (or Amplify Hosting).
- **Mobile:** Expo EAS Build → App Store / Play Store; point `EXPO_PUBLIC_API_URL` at the ALB/api domain.

```
DATABASE_URL=postgres://…
REDIS_URL=redis://…
DJANGO_SECRET_KEY=
DJANGO_ALLOWED_HOSTS=api.gigkraft.com
CORS_ALLOWED_ORIGINS=https://admin.gigkraft.com
# web-admin:  VITE_API_URL=https://api.gigkraft.com
# mobile:     EXPO_PUBLIC_API_URL=https://api.gigkraft.com
```

---

## 7. Env var checklist by repo

| Repo | Needs |
|---|---|
| `gigkraft-backend` | everything above except the publishable/client keys |
| `gigkraft-web-admin` | `VITE_API_URL`, `STRIPE_PUBLISHABLE_KEY`, `GOOGLE_OAUTH_CLIENT_ID` |
| `gigkraft-mobile` | `EXPO_PUBLIC_API_URL`, `STRIPE_PUBLISHABLE_KEY`, Google client IDs, `google-services.json` / `GoogleService-Info.plist` |

> None of these are wired in the prototypes (they're static) — this doc is the integration contract for the real build.

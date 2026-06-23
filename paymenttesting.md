# GigKraft Stripe Payment Testing Specs

This document defines what needs to be verified before Stripe payments are considered production-ready, organized as a manual walk-through you can execute step by step. The automated scripts (to be implemented) map 1:1 to these specs.

---

## How the Stripe integration works

| Layer | What it does |
|---|---|
| `STRIPE_MODE` env var | `"test"` locally, `"live"` in Railway prod |
| `StripeSettings` (DB singleton) | Stores price IDs per environment; read via GK Admin → Stripe |
| `/api/billing/checkout` | Creates a Stripe Checkout Session and returns a redirect URL |
| `/api/stripe/webhook` | Receives signed Stripe events; activates subscriptions and upgrades roles |
| `/api/billing/subscription` | Returns current subscription status for the logged-in user |
| Stripe CLI (local only) | Forwards Stripe webhook events to localhost |

Mode selection logic:
- `STRIPE_MODE=test` → uses `STRIPE_TEST_SECRET_KEY` and test price IDs
- `STRIPE_MODE=live` → uses `STRIPE_SECRET_KEY` and live price IDs

---

## Part 1 — Local Test Mode

### 1.1 Environment variable checklist

All of these must be set in `backend/.env` before running locally.

| Variable | Required value | Where to get it |
|---|---|---|
| `STRIPE_MODE` | `test` | Hardcode this |
| `STRIPE_TEST_SECRET_KEY` | `sk_test_51...` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Output of `stripe listen` command (see 1.2) |
| `MOCK_STRIPE` | `false` | Enables real Stripe calls |
| `MOCK_RESEND` | `true` | Keeps email in mock mode so receipts don't send |

Frontend env (`frontend/.env`):

| Variable | Required value | Where to get it |
|---|---|---|
| `VITE_STRIPE_TEST_PUBLISHABLE_KEY` | `pk_test_51...` | Stripe Dashboard → Developers → API keys |
| `VITE_STRIPE_TEST_PRICING_TABLE_ID` | `prctbl_...` | Stripe Dashboard → Products → Pricing tables |

**Config check script**: `python scripts/stripe_check.py` reads these and reports pass/fail for each.

---

### 1.2 Stripe CLI webhook forwarding (required for local webhooks)

The Stripe CLI must be running whenever you test checkout locally. Without it, the webhook never fires and the subscription is never activated.

**Steps:**
1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Log in: `stripe login`
3. Start forwarding:
   ```
   stripe listen --forward-to localhost:8000/api/stripe/webhook
   ```
4. Copy the `whsec_...` secret printed by the CLI.
5. Paste it into `backend/.env` as `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Restart the backend server.

**Verification**: The CLI terminal should show `Ready! Your webhook signing secret is whsec_...` and remain running while you test.

---

### 1.3 Price ID configuration (GK Admin → Stripe)

Stripe needs price IDs configured in the database (not just env vars). These are created in the Stripe Dashboard and stored via the GK Admin panel.

**Steps:**
1. Go to Stripe Dashboard (test mode) → Products → Create or select a product.
2. Create two prices:
   - Monthly: `$24.99/month` (recurring)
   - Annual: `$249.99/year` (recurring)
3. Copy both price IDs (`price_...`).
4. Open GK Admin → Stripe (or `http://localhost:5173/gk-admin/stripe`).
5. Paste both price IDs into the **Test** fields.
6. Click Save.

**Config check script verification**: `python scripts/stripe_check.py --admin-token <token>` verifies price IDs are set for the current mode.

---

### 1.4 Stripe API connection test

Before running any checkout, verify that your secret key can reach Stripe.

**Steps:**
1. Go to GK Admin → Stripe → click **Test Connection**.
2. Expected result: green badge showing account name and account ID (`acct_...`).

**Config check script**: The script calls `/api/gk-admin/stripe-config/test-connection` and reports the same result automatically.

---

## Part 2 — End-to-End local test cases

Run these in order. All use Stripe test cards (any future expiry date, any 3-digit CVV).

### Test cards

| Card number | Behavior |
|---|---|
| `4242 4242 4242 4242` | Always succeeds |
| `4000 0000 0000 0002` | Always declined |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

---

### TC-01: Successful monthly checkout (happy path)

**Pre-conditions:** User is logged in with `member` or `pro` role. No active subscription. Stripe CLI is running.

**Steps:**
1. Navigate to `/pro/billing/test`.
2. Confirm the environment panel shows: Stripe=TEST, Webhook secret=set, Resend=MOCK.
3. Click **Monthly**.
4. You are redirected to Stripe Checkout.
5. Enter card `4242 4242 4242 4242`, any future expiry, any CVV, any zip.
6. Click Pay.

**Expected results:**
- Redirected back to `/pro/billing/success`.
- Stripe CLI terminal logs `checkout.session.completed`.
- Backend logs show subscription created and role upgraded.
- `/api/billing/subscription` now returns `has_active_subscription: true`, `status: "active"`, `plan: "monthly"`.
- `card_last4` matches the last 4 digits of the card used.
- `renews_at` is approximately 30 days from today.

**Failure indicators:**
- Redirected back with `?cancelled=1` → checkout was aborted.
- Subscription still shows `has_active_subscription: false` → webhook did not fire. Check that Stripe CLI is running and `STRIPE_WEBHOOK_SECRET` matches the `whsec_` shown by the CLI.

---

### TC-02: Successful annual checkout

Same as TC-01 but click **Annual** in step 3.

**Expected results:**
- Same as TC-01 but `plan: "annual"` and `renews_at` approximately 365 days from today.

---

### TC-03: Declined card

**Pre-conditions:** Reset subscription (see TC-07 first if you already have one).

**Steps:**
1. Navigate to `/pro/billing/test`.
2. Click **Monthly**.
3. Enter card `4000 0000 0000 0002`, any future expiry, any CVV.
4. Click Pay.

**Expected results:**
- Stripe Checkout shows a decline error message.
- No subscription is created.
- `/api/billing/subscription` still returns `has_active_subscription: false`.

---

### TC-04: 3D Secure card

**Pre-conditions:** Reset subscription.

**Steps:**
1. Navigate to `/pro/billing/test`.
2. Click **Monthly**.
3. Enter card `4000 0025 0000 3155`.
4. Complete the 3D Secure authentication dialog (click Authorize).

**Expected results:**
- Checkout succeeds after authentication.
- Subscription activated (same as TC-01).

---

### TC-05: Webhook — subscription cancelled

Simulates what happens when a subscription is cancelled from the Stripe Dashboard.

**Steps (using Stripe CLI):**
1. Find the `sub_...` ID from `/api/billing/subscription`.
2. Cancel the subscription in Stripe Dashboard → Customers → find the customer → cancel.
3. Watch the Stripe CLI terminal for `customer.subscription.deleted`.

**Expected results:**
- `/api/billing/subscription` returns `status: "cancelled"` after the webhook fires.

**Alternative (using webhook simulator script):**
```
python scripts/stripe_webhook_sim.py --event subscription_deleted --sub-id sub_xxx
```

---

### TC-06: Webhook — payment failed

Simulates a payment failure (e.g., card expired on renewal).

**Steps (using Stripe CLI trigger):**
```
stripe trigger invoice.payment_failed
```
Or use the simulator:
```
python scripts/stripe_webhook_sim.py --event payment_failed --sub-id sub_xxx
```

**Expected results:**
- `/api/billing/subscription` returns `status: "past_due"`.
- Backend logs show payment failed email attempt (mocked since MOCK_RESEND=true).

---

### TC-07: Subscription reset (re-test the checkout flow)

Resets the local subscription row so you can run TC-01 again without creating a new user.

**Steps:**
1. Navigate to `/pro/billing/test`.
2. Scroll to the red "Reset" card at the bottom.
3. Click **Reset Subscription** and confirm.

**Expected results:**
- Subscription row is deleted from the database.
- `/api/billing/subscription` returns `has_active_subscription: false`.

**Note:** This only deletes the local DB row. Go to Stripe Dashboard → Customers and cancel the test subscription there too, or you'll accumulate orphaned test subscriptions.

---

### TC-08: Webhook signature rejection

Verifies that the webhook endpoint rejects tampered payloads.

**Steps:**
```
python scripts/stripe_webhook_sim.py --event checkout_completed --bad-sig
```

**Expected results:**
- Server returns HTTP 400.
- Backend logs show "Stripe webhook: invalid signature".

---

### TC-09: Coupon code

**Pre-conditions:** An active subscription. A coupon exists in the DB (create via Django admin or management command).

**Steps:**
1. Go to `/pro/account?tab=billing`.
2. Enter a valid coupon code and apply.

**Expected results:**
- `discount_pct` updates on the subscription.
- `monthly_value` reflects the discounted price.

---

### TC-10: Missing price ID

Verifies the system gives a clear error when price IDs are not configured.

**Steps:**
1. In GK Admin → Stripe, clear the monthly price ID and save.
2. Navigate to `/pro/billing/test` and click Monthly.

**Expected results:**
- Server returns HTTP 400 with message: `No Stripe price ID configured for the 'monthly' plan (test mode). Set it in GK Admin → Stripe.`
- No redirect to Stripe.

---

## Part 3 — Automated test suite

Run with: `python manage.py test billing`

### Test class: WebhookTests

| Test | What it verifies |
|---|---|
| `test_checkout_completed_creates_subscription` | checkout.session.completed → subscription created, role upgraded to PRO, invoice row created, emails triggered |
| `test_checkout_completed_idempotent` | Same event sent twice → only one subscription row created |
| `test_subscription_deleted_cancels_subscription` | customer.subscription.deleted → status set to cancelled |
| `test_payment_failed_sets_past_due` | invoice.payment_failed → status set to past_due, payment failed email triggered |
| `test_invalid_signature_returns_400` | Tampered Stripe-Signature → 400 response |
| `test_missing_webhook_secret_returns_500` | STRIPE_WEBHOOK_SECRET not set → 500 response |

All webhook tests use a real HMAC-signed payload (not mocked signature verification). `stripe.Subscription.retrieve` is mocked to return a fake subscription object.

### Test class: BillingApiTests

| Test | Endpoint | What it verifies |
|---|---|---|
| `test_subscription_status_no_subscription` | `GET /api/billing/subscription` | Returns `has_active_subscription: false` when no real sub exists |
| `test_subscription_status_with_active_subscription` | `GET /api/billing/subscription` | Returns full subscription data when a real sub exists |
| `test_checkout_creates_session_url` | `POST /api/billing/checkout` | Returns a Stripe checkout URL |
| `test_checkout_annual_plan` | `POST /api/billing/checkout` | Uses the annual price ID |
| `test_checkout_invalid_plan` | `POST /api/billing/checkout` | Returns 400 for unrecognized plan name |
| `test_checkout_missing_price_id` | `POST /api/billing/checkout` | Returns 400 when price ID is not configured |
| `test_billing_config_shows_mode` | `GET /api/billing/config` | Returns correct mode and webhook secret status |
| `test_reset_subscription_test_mode_works` | `DELETE /api/billing/subscription/reset` | Deletes subscription row in test mode |
| `test_reset_subscription_live_mode_blocked` | `DELETE /api/billing/subscription/reset` | Returns 403 in live mode |
| `test_billing_history_empty` | `GET /api/billing/history` | Returns empty list when no invoices exist |
| `test_apply_coupon` | `POST /api/billing/coupon` | Applies discount to subscription |
| `test_apply_invalid_coupon` | `POST /api/billing/coupon` | Returns 400 for unknown or inactive coupon |

### Config check script: `scripts/stripe_check.py`

| Check | What it verifies | How |
|---|---|---|
| Env vars present | All required Stripe env vars are set | Reads `backend/.env` |
| API reachable | Server is running | GET `/api/health` |
| Billing config | Mode matches expected, webhook secret is set | GET `/api/billing/config` |
| Stripe connection | API key is valid | POST `/api/gk-admin/stripe-config/test-connection` |
| Price IDs set | Both monthly and annual price IDs configured for current mode | GET `/api/gk-admin/stripe-config` |
| Checkout session | Can create a Stripe Checkout Session | POST `/api/billing/checkout` |

### Webhook simulator: `scripts/stripe_webhook_sim.py`

| Event | CLI flag | What it simulates |
|---|---|---|
| `checkout.session.completed` | `--event checkout_completed` | Successful payment, subscription creation |
| `customer.subscription.deleted` | `--event subscription_deleted` | Cancellation from Stripe Dashboard |
| `invoice.payment_failed` | `--event payment_failed` | Failed renewal charge |

All events are signed with a valid HMAC using `STRIPE_WEBHOOK_SECRET`. No Stripe library required — uses stdlib `hmac` + `hashlib`.

---

## Part 4 — Migrating to production

### 4.1 Railway environment variables

Set these in Railway → your service → Variables. **Do not** commit a `.env` file to the repo.

| Variable | Value |
|---|---|
| `STRIPE_MODE` | `live` |
| `STRIPE_SECRET_KEY` | `sk_live_51...` (from Stripe Dashboard in live mode) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Stripe Dashboard → Webhooks → your webhook endpoint) |
| `MOCK_STRIPE` | `false` |
| `MOCK_RESEND` | `false` |
| `RESEND_API_KEY` | Your Resend API key (so receipt emails actually send) |
| `APP_URL` | `https://gigkraft.com` (controls success/cancel redirect URLs) |

Vercel environment variables:

| Variable | Value |
|---|---|
| `VITE_STRIPE_LIVE_PUBLISHABLE_KEY` | `pk_live_51...` |
| `VITE_STRIPE_LIVE_PRICING_TABLE_ID` | `prctbl_...` (from Stripe Dashboard live mode → Pricing tables) |

### 4.2 Stripe Dashboard webhook registration

Stripe's live mode requires you to register the webhook endpoint so Stripe can send events to it.

**Steps:**
1. Go to Stripe Dashboard (switch to **live mode**) → Developers → Webhooks.
2. Click **Add endpoint**.
3. Endpoint URL: `https://api.gigkraft.com/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click Add endpoint.
6. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in Railway.

### 4.3 Prod price IDs

Live-mode price IDs are different from test-mode price IDs. You must create them in the Stripe Dashboard (live mode).

**Steps:**
1. Stripe Dashboard (live mode) → Products → create monthly and annual prices.
2. Copy the `price_live_...` IDs.
3. Go to GK Admin → Stripe on the production app (`https://gigkraft.com/gk-admin/stripe`).
4. Paste into the **Live** fields and save.

---

## Part 5 — Production verification

Run these after deploying to Railway/Vercel with live mode configured.

### 5.1 Config check (automated)

```
python scripts/stripe_check.py \
  --base-url https://api.gigkraft.com \
  --token <your-pro-jwt> \
  --admin-token <your-gk-admin-jwt>
```

All checks must pass before proceeding to manual verification.

### 5.2 Live test transaction (use a real card)

Make a real purchase with a low-risk real card to confirm the end-to-end flow in production. Immediately refund it from the Stripe Dashboard afterward.

**Steps:**
1. Create a new test account (do not use your own account for this).
2. Sign up as a member, then go to billing.
3. Subscribe with a real card.
4. Verify the subscription is activated and the welcome email is received.
5. Go to Stripe Dashboard → Customers → find the customer → refund the payment.
6. Cancel the subscription in Stripe Dashboard.
7. Confirm the webhook fires and the subscription status updates to `cancelled`.

### 5.3 Webhook delivery confirmation (Stripe Dashboard)

After the live test transaction:
1. Stripe Dashboard → Developers → Webhooks → your endpoint.
2. Confirm all three events show successful delivery (green checkmarks).
3. Check backend Railway logs for the webhook handler output.

### 5.4 Prod config check (automated)

After the live test:
```
python scripts/stripe_check.py \
  --base-url https://api.gigkraft.com \
  --token <your-pro-jwt> \
  --admin-token <your-gk-admin-jwt>
```

Expected: all checks pass, mode shows `live`, subscription status reflects the active subscription.

---

## Failure modes and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| `has_active_subscription` stays false after checkout | Webhook not received | Check Stripe CLI is running (local) or webhook endpoint is registered (prod) |
| 400 "No Stripe price ID configured" | Price IDs not set in DB | GK Admin → Stripe → set price IDs for current mode |
| 400 "Stripe secret key not set" | Secret key env var missing | Add `STRIPE_TEST_SECRET_KEY` (local) or `STRIPE_SECRET_KEY` (prod) |
| 500 "Webhook secret not configured" | `STRIPE_WEBHOOK_SECRET` missing | Get from Stripe CLI output or Stripe Dashboard |
| 400 "Invalid signature" on webhook | Webhook secret mismatch | Ensure `STRIPE_WEBHOOK_SECRET` exactly matches the `whsec_` from Stripe |
| Checkout redirects to wrong URL | `APP_URL` not set | Set `APP_URL=https://gigkraft.com` in Railway (or `http://localhost:5173` locally) |
| Emails not sending in prod | `MOCK_RESEND` still true or `RESEND_API_KEY` missing | Set `MOCK_RESEND=false` and add `RESEND_API_KEY` in Railway |
| Role not upgraded after payment | `ensure_role_profile` failed or wrong `user_id` in metadata | Check backend logs for "Role upgrade failed" errors |
| Subscription created twice | Webhook replayed | Expected — idempotency check prevents duplicate rows |

---

## Implementation checklist for the test code

- [ ] `billing/tests.py` — Django tests (run with `python manage.py test billing`)
- [ ] `scripts/stripe_check.py` — Config and connectivity checker
- [ ] `scripts/stripe_webhook_sim.py` — Webhook event simulator with HMAC signing

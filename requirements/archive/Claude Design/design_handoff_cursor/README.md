# GigKraft — Developer Handoff for Cursor

> **Target stack (final — decided with the product owner)**
> - **Mobile** (Handyman Pro + Homeowner apps): **React Native + Expo + TypeScript**
> - **Web admin** (Node Manager console): **React + Vite + TypeScript + Tailwind + Mantine v7**
> - **Backend / API**: **Django + Django Ninja + PostgreSQL** (Django ORM models, Ninja routers, auto OpenAPI)
> - **Repos**: **three separate repos** — `gigkraft-backend`, `gigkraft-web-admin`, `gigkraft-mobile`

This bundle is a **design + spec handoff**, not a codebase to copy. It contains the interactive **HTML/React prototypes** (the pixel source of truth) plus written specs that map every screen, token, component, data shape and integration onto the stack above. **Cursor writes the actual code** — these docs tell it exactly what to build.

---

## 0. How to read this bundle

| File | What it gives you |
|---|---|
| **README.md** (this) | Product context, final stack, decisions, repo layout, build order, golden rules. |
| **01_DESIGN_SYSTEM.md** | Every design token + a ready-to-paste Mantine `theme.ts` (web) and a React Native `tokens.ts` theme (mobile). Start here. |
| **02_SCREENS.md** | All **25 screens**: purpose, layout, components, copy, states, interactions. |
| **03_BACKEND.md** | Django models, Postgres schema, Django Ninja routers/schemas, auth, and the business rules (incl. the mandatory-After guardrail). |
| **04_MOBILE.md** | React Native (Expo) project structure + the HTML-component → React Native mapping. |
| **05_INTEGRATIONS.md** | Twilio (SMS/WhatsApp), Stripe, AWS S3, Firebase Cloud Messaging, Google OAuth, AWS deploy — with env vars per repo. |
| **design_reference/** | The actual interactive prototypes. Open `design_reference/GigKraft App.html` in a browser to click through all 25 screens. **This is the source of truth for pixels.** |

**Fidelity: HIGH.** Colors, type, spacing, copy and interactions are final. Recreate the UI faithfully using React Native (mobile) and React + Mantine (web) — do not ship the HTML.

---

## 1. Product in one paragraph

GigKraft is a **hyper-localized handyman marketplace** that runs on independent **regional nodes** (e.g. `southwest-us-04`). Its defining rule: pros prove themselves with **visual before/after "Krafts" backed by a confirmed invoice cost** — not text bios or unverified stars. Homeowners browse *proof*. Emergencies are **broadcast to nearby pros over SMS + WhatsApp**. Pros pay a flat **$19.99/mo** (or $199/yr) to publish and claim leads. Each node is run by a **Community Node Manager** through a desktop admin console.

**Three role tracks (25 screens total):**
1. **Handyman Pro** — mobile (React Native) — 13 screens (`1.1`–`1.13`)
2. **Homeowner / Consumer** — mobile (React Native) — 6 screens (`2.1`–`2.6`)
3. **Node Admin** — desktop web (React + Mantine) — 6 screens (`3.1`–`3.6`)

---

## 2. Vocabulary (use these exact terms in code + UI)

| Term | Meaning | Suggested code name |
|---|---|---|
| **Kraft** | A published before/after case study (mandatory After photo + invoice cost) | `Kraft` model |
| **Node** | A regional operational zone | `Node` model, `node_id` like `southwest-us-04` |
| **Proof** | The verified before/after + invoice that replaces reviews | — |
| **Lead** | A homeowner inquiry a pro can claim | `Lead` model |
| **Broadcast** | An emergency blasted to local pros over SMS/WhatsApp | `EmergencyBroadcast` |
| **Vault** | The pro's subscription/billing area | billing module |
| **Recommendation** | A client's verified review (magic-link, no account) | `Recommendation` |
| **Triage** | Admin routing of unclaimed emergencies | admin triage desk |
| **Node Manager** | Admin/operator of a node | `User.role = node_manager` |

Voice: confident field-ops dispatcher meets friendly neighbor. CTAs are imperative verbs ("Publish Kraft", "Broadcast to local pros", "Request a quote"). Numbers are always concrete and locality-stamped ("1.4 mi", "Verified invoice $1,840", "142 pros").

---

## 3. Repo layout (three separate repos)

```
gigkraft-backend/             # Django + Django Ninja + Postgres
├─ config/                    # settings (split: base/dev/prod), asgi/wsgi
├─ accounts/                  # User, ProProfile, HomeownerProfile, auth (OTP + Google + email/pw)
├─ nodes/                     # Node, NodeMembership
├─ krafts/                    # Kraft, KraftPhoto (mandatory-After rule)
├─ leads/                     # Lead, Message, Quote, Invoice
├─ emergencies/               # EmergencyBroadcast, BroadcastDispatch (Twilio)
├─ recommendations/           # Recommendation (magic-link review)
├─ billing/                   # Subscription, BillingInvoice, Coupon (Stripe)
├─ notifications/             # DeviceToken, push (FCM)
├─ media/                     # S3 presigned-upload helpers
└─ api/                       # Ninja api root, routers, schemas → /api/docs

gigkraft-web-admin/           # React + Vite + TS + Tailwind + Mantine (admin 3.1–3.6)
├─ src/theme.ts               # paste from 01_DESIGN_SYSTEM.md
├─ src/lib/api.ts             # typed client generated from Ninja OpenAPI
├─ src/components/            # MetricTile, DataTable, Panel, Pill, BrowserChrome…
└─ src/pages/                 # Ops, Triage, Safety, Ledger, Krafts, Settings

gigkraft-mobile/              # React Native + Expo + TS (pro 1.x + homeowner 2.x)
├─ src/theme/tokens.ts        # paste from 01_DESIGN_SYSTEM.md
├─ src/api/                   # typed client (openapi-typescript) + react-query hooks
├─ src/components/            # GkButton, GkCard, GkField, BeforeAfter, PhoneScaffold…
├─ src/features/pro/          # 13 handyman screens + ProShell tabs
└─ src/features/home/         # 6 homeowner screens + HomeShell tabs
```

> **Tailwind + Mantine together (web):** Mantine owns components, theming and color-scheme; Tailwind is for one-off layout utilities. Disable Tailwind's preflight (or scope it) so it doesn't fight Mantine's resets — set `corePlugins: { preflight: false }` in `tailwind.config`. Keep tokens in sync by mapping Tailwind colors to the same hex scales in 01.

---

## 4. Recommended build order (all 3 tracks in parallel-ish; MVP = everything)

1. **Backend foundation** — `accounts`, `nodes`, auth (phone OTP + Google + email/password). Stand up Django Ninja at `/api/`, OpenAPI at `/api/docs`.
2. **Generate typed clients** from the OpenAPI spec: `openapi-typescript` (+ `openapi-fetch` / `orval`) for **both** the web admin and the React Native app — one schema, two clients.
3. **Design system first** — paste `theme.ts` into web-admin, `tokens.ts` into mobile. Build the shared primitives (see 01 §5 + 04) before screens.
4. **Krafts module** — implement the **mandatory-After + confirmed-invoice** rule server-side first (the product's core guardrail; see 03 §3).
5. **Screens** — admin (3.1–3.6) in React; pro (1.x) + homeowner (2.x) in React Native. Each screen's spec is in 02_SCREENS.md.
6. **Integrations** — wire Twilio (broadcast SMS + WhatsApp), Stripe (subscription), S3 (photo upload), FCM (push). See 05_INTEGRATIONS.md.

---

## 5. Golden rules (don't skip)

- **Proof over prose.** Never add free-text "bio as reputation" or unverified star inflation. Reputation = approved Krafts + magic-link recommendations + verified invoices.
- **Mandatory After.** A Kraft cannot be published or admin-verified without (a) at least one After photo and (b) a confirmed invoice cost. Enforce in the model `.clean()`/serializer **and** the API.
- **Everything is node-scoped.** Pros, leads, Krafts, broadcasts and metrics are filtered by `node_id`. Search ranks by proximity (ZIP/radius) — **MVP is ZIP-radius only, no map UI**.
- **4-hour response promise.** Pros set a guaranteed response time (default 4h); leads track against it; admin SLA dashboards roll it up.
- **Cross-channel.** Emergencies fan out over SMS + WhatsApp (Twilio); first pro to claim opens a direct chat.

---

## 6. Decisions on file (resolved with the product owner)

| Area | Decision |
|---|---|
| Mobile framework | **React Native + Expo + TypeScript** (chosen for "decide for me": unifies the frontend on React/TS with the admin; prototypes are React so the mapping is 1:1) |
| Web admin | React + Vite + TypeScript + **Tailwind + Mantine v7** |
| API layer | **Django Ninja** (Pydantic schemas, auto OpenAPI) |
| Auth | **Phone OTP (SMS) + Google sign-in + Email/password** — all three |
| SMS / WhatsApp | **Twilio** (chosen for "decide for me") |
| Payments | **Stripe** ($19.99/mo or $199/yr) |
| Maps / geo | **ZIP-radius only, no map UI for MVP** |
| File storage | **AWS S3** (chosen for "decide for me": matches AWS hosting) |
| Push | **Firebase Cloud Messaging** |
| Hosting | **AWS** |
| Repos | **Separate** (backend / web / mobile) |
| Deliverable | **Specs + prototypes only** — Cursor writes the code |
| MVP scope | **All 3 tracks at once** |

Anything not listed (analytics, CI, exact AWS services) is left to the dev's discretion — sensible defaults noted in 05.

---

## 7. Icons & fonts

- **Icons:** the prototypes use **Tabler Icons**. Web: `@tabler/icons-react`. React Native: `@tabler/icons-react-native` (or `react-native-tabler-icons`). Icon names in the specs are Tabler names (e.g. `broadcast`, `discount-check`, `map-pin`).
- **Fonts:** UI = **Manrope**; numeric/codes/ZIPs/money = **JetBrains Mono**. Both on Google Fonts. Web: `@fontsource` or a `<link>`. Expo: `expo-font` + `@expo-google-fonts/manrope` + `@expo-google-fonts/jetbrains-mono`.

> The older brand README at the project root mentions Fredoka/Quicksand and a neo-brutalist look — **ignore that. This Manrope + Mantine-blue build supersedes it** and is what the prototypes show.

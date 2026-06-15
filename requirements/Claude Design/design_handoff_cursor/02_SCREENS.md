# 02 · Screens — all 25

Open `design_reference/GigKraft App.html` and click into each role to see these live. Numbers match the in-app index rail. Mobile screens are **390×844** (React Native); admin is **1440×900 desktop** (React + Mantine).

Conventions used below: **AppBar** = sticky top bar (back/avatar + title + actions). **Body** = scrolling content, 16px padding. **Footer** = sticky bottom action. **BottomTab** = 5-item nav.

---

## Track 1 — Handyman Pro (mobile, React Native) · 13 screens

Bottom tabs: **Leads · Stats · ＋Add (center) · Network · Account**.

### 1.1 Authentication
- **Purpose:** Pro signs up / logs in.
- **Layout:** Onboarding header (title + "Step 1 of 5" + progress dots + Skip). Body: H1 "Join the proof network", Google button, "or" divider, card with Email + Mobile inputs (icons mail/phone), legal line. Footer: "Continue".
- **States:** SMS OTP after submit (4-digit). Validate email + E.164 phone.

### 1.2 Service Area
- **Purpose:** Define where the pro works (ranks proximity in search).
- **Components:** Home ZIP input; SegmentedControl **Specific ZIPs ↔ Center + radius**. ZIP mode: list of up to 3 editable ZIP rows (add/remove). Radius mode: center ZIP + **Slider 1–100 mi** + a live map circle.
- **State:** `mode`, `zips[]`, `radiusMiles`.

### 1.3 Visual Customization
- **Purpose:** Profile photo + header wallpaper.
- **Components:** Live profile preview card (wallpaper band + avatar overlapping −36px + name/trade). "Use Google photo / Upload" buttons. Wallpaper swatch picker (5 gradient presets + add).
- **State:** `wallpaperId`, `photoSource`.

### 1.4 Professional Credentials
- **Purpose:** Licenses, insurance, response promise.
- **Components:** Availability SegmentedControl (Full/Part-time). **Licensed** switch → license number + upload PDF slot. **Insured** switch → COI upload slot. **Select: Guaranteed response time** (default **4 hours**).
- **State:** `availability`, `licensed`, `insured`, `responseHours`. Note: `responseHours` feeds the SLA the whole app tracks.

### 1.5 Core Categorization
- **Purpose:** Trade + skill tags + bio; finishes onboarding → goes live in node.
- **Components:** Primary trade Select; tappable **skill-tag chips** (toggle add/remove, suggestions provided); bio Textarea (max 500, live counter). Footer: "Finish & go live".

### 1.6 Project Creator ("Add Kraft") — ⭐ core
- **Purpose:** Publish a verified before/after case study.
- **Components:** Title, Description, **Final job cost** Select; "Before/after project?" switch. **Before photos** grid (optional, dashed slots). **After photos** grid — **required**, dashed-accent slots, a "Required → Proof set" badge that flips green once an After is added.
- **Rule:** **Publish disabled until ≥1 After photo exists.** Footer label reflects this ("Add an After photo to publish" → "Publish Kraft").

### 1.7 Recommendation Request Engine
- **Purpose:** Ask a past client for a magic-link review.
- **Components:** Client name + phone/email; channel picker **WhatsApp / SMS / Email**; secure magic-link row with copy button; "Recent requests" list (Sent/Opened/Reviewed status pills). Footer: "Send review link".

### 1.8 Recommendation Moderation Queue
- **Purpose:** Approve/reply to incoming recommendations before they go public.
- **Components:** Cards: client avatar + relation + time + stars; quote text; job photos; **Reply / Approve & publish** actions. Approved card collapses to "Published to profile".

### 1.9 Leads Dashboard
- **Purpose:** Triage inbound jobs.
- **Components:** SegmentedControl **Active / In-progress / Archived**. Lead cards: avatar, name, job, 2-line message preview, **response-timer pill** (green normal / red urgent, "3h 48m left"), unread count. Active uses timers; other tabs use status pills (Scheduled/Quoted/Won). Tapping → 1.10.

### 1.10 Direct Chat
- **Purpose:** Message a client, send quote/invoice.
- **Components:** AppBar with avatar + "1.4 mi". Message bubbles (mine = blue right, theirs = surface left), photo bubble, date divider. Footer: horizontal **quick-action chips** (Send quote, Send invoice, Mark complete, Request review) + attach + input + send. Auto-scroll to newest.

### 1.11 Performance & Analytics
- **Purpose:** The pro's numbers in the node.
- **Components:** Range SegmentedControl (7/30/90d). Stat grid (Profile views, Search appearances, Link clicks, Won jobs) with deltas. Conversion card (38% donut + avg-response SLA row). Revenue card ($11,460 + bar chart). Trust stats.

### 1.12 Subscription & Billing ("Vault")
- **Purpose:** Manage the $19.99/mo (or $199/yr) plan.
- **Components:** Gradient plan hero (Pro Vault · Annual, renews date). Coupon input + apply. Payment method row (•••• 8832, Update). Billing history list with download per invoice.

### 1.13 B2B Networking Search
- **Purpose:** Find complementary trades to refer.
- **Components:** Trade + ZIP search row. Pro result cards: avatar, name, trade, skill tags, distance, call button.

**Account hub** (Account tab): profile card (Verified/Insured badges) + grouped links into 1.7, 1.8, 1.2–1.5, 1.12.

---

## Track 2 — Homeowner / Consumer (mobile, React Native) · 6 screens

Bottom tabs: **Discover · Messages · 🚨Emergency (center) · Recommend · You**.

### 2.1 Visual Discovery Feed
- **Purpose:** Browse *proof*, not reviews.
- **Components:** Search input; horizontal trade filter chips (All/Plumbing/…). Proof cards: **BeforeAfter** banner + "Verified invoice" badge; pro avatar, job title, **actual cost** (bold), distance, recommendations count, star rating. Tap → 2.2.

### 2.2 Pro Profile / Proof Detail
- **Purpose:** Evaluate a pro from verified work.
- **Components:** Stat strip (recs / rating / verified+licensed). Featured Kraft card: BeforeAfter + **green "Verified job invoice $1,840"** row + description. "More verified work" 2-up grid. Client quote. Footer: **Message / Request a quote**.

### 2.3 Emergency Broadcast — ⭐ core
- **Purpose:** Blast nearby pros now.
- **Components:** Emergency-type grid (burst/power/HVAC/lock/other). Description Textarea, Address, **budget Slider $50–1000**. "Sent over SMS + WhatsApp" note. Footer: red **Broadcast to local pros**.
- **Success state:** pulsing broadcast icon, "Dispatched to 8 local pros", live claim list (Marcus claimed 1m / others notified), "Open chat" CTA.

### 2.4 Request a Quote / Chat
- **Purpose:** Negotiate and accept a quote.
- **Components:** Chat thread; an inline **Quote card** (line items + total $148 + Counter / Accept). Accepting fires a toast.

### 2.5 Leave a Recommendation (magic-link)
- **Purpose:** Verified review with no account.
- **Components:** Job summary card; large **interactive star rating**; Textarea; optional own before/after photo slots; "secure link" note. Footer: "Publish recommendation".

### 2.6 Your Account (homeowner hub)
- **Purpose:** The homeowner's profile, saved pros, job history and dispatch preferences (the "You" tab).
- **Components:**
  - **Profile card** — avatar, name, saved primary address (`map-pin`), **Edit** button.
  - **Stat strip** — Jobs hired / Saved pros / Recs given (flat card, 3-up, divided).
  - **Saved pros** list — avatar + name + trade + distance + recs; row tap → 2.2 proof detail; inline **message** icon → 2.4 chat. "Discover more" link → 2.1.
  - **Past jobs** list — each row: green "After" thumbnail, job title, pro · date, **verified invoice amount** (mono, green); if not yet reviewed, an inline **Recommend** link → 2.5, else a green "Recommended" badge.
  - **Dispatch alerts** card — three `Switch` rows: **SMS alerts**, **WhatsApp dispatch**, **Weekly node digest** (digest off by default).
  - **Settings list** — rows with chevron: Saved addresses ("2 properties"), Payment methods ("Visa ··4291"), Help & safety.
  - **Sign out** (default button, red text) + version footer.
- **Data:** backed by `HomeownerProfile`, `SavedPro`, `Address`, `NotificationPref`, and past `Lead`/`Quote` history (see 03 §2). Toggles persist to `NotificationPref`.

**Note:** the Pro track has an analogous **Account hub** on its Account tab (profile card with Verified/Insured badges + grouped links into 1.7, 1.8, 1.2–1.5, 1.12) — it is a navigation hub, not a separately numbered screen.

---

## Track 3 — Node Admin (desktop web, React + Mantine + Tailwind) · 6 screens

Layout: **browser chrome** → left **sidebar** (node SW-04, nav with badges, manager profile) + **top bar** (title + "Node live" + Alerts + theme) + content. Sidebar items carry attention badges (Triage 3, Safety 3, Krafts 2).

### 3.1 Regional Core Ops (dashboard)
- 4 metric tiles (Pending triage / Active pros 142 / Avg response 1h52m / **Monthly run rate $2,838** accent). Throughput bar chart (6 weeks) + jobs/win-rate/repeat stats. SLA donut (92%) + per-trade bars. Recent node activity feed (color-dot rows).

### 3.2 Cross-Channel Triage Desk
- Metric tiles (Unrouted / Claimed today / Avg claim time). **DataTable**: Task #, Context (+age pill), Budget, **Dispatch actions: WhatsApp Blast + SMS Pin**. SMS-pin removes the row (routed). Empty state when clear.

### 3.3 Safety & Hygiene
- Metric tiles (Open disputes / Suspended / Hygiene score). **DataTable**: Log #, Profile (avatar), Infraction, severity pill, **Dismiss / Suspend** overrides. Rows resolve out; empty state.

### 3.4 Pro Ledger
- Searchable **DataTable** of 142 pros: Pro (avatar), Trade, Krafts, Recs, Avg SLA, Plan pill, Status pill (Active/At risk/Suspended). "Invite pro" action.

### 3.5 Kraft Verification — ⭐ core
- 2-up cards of submitted Krafts: BeforeAfter + pro + **two proof pills (After photo ✓/✗, Invoice ✓/✗)**. **Verify is disabled unless BOTH pass**; trying to verify an incomplete Kraft toasts "proof incomplete". Reject notifies the pro.

### 3.6 Node Settings & Billing
- Node config panel: **Auto-blast emergencies** switch, **15-min escalation** switch, Node ID + Response-SLA select, Save. Billing ledger panel: monthly run rate hero ($2,838.58), breakdown rows, Export CSV.

---

## Interaction notes (apply everywhere)
- **Toasts** confirm every mutation (publish, send, dispatch, verify, save) — bottom-center, 2.2s.
- **Theme** persists in `localStorage('gk_theme')` in the prototype → use Mantine color-scheme manager (web) and a persisted theme `mode` via `ThemeContext` (React Native).
- **Transitions** 0.15s on chrome; press-scale 0.99 on cards. No ambient/looping animation except the emergency broadcast pulse.
- **Empty/disabled states** are specified above where they carry product meaning (mandatory-After gating is the important one — mirror it server-side).
```

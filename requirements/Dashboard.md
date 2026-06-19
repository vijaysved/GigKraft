# Pro Dashboard Requirements

**Replaces** the existing stats screen entirely. Rename the nav menu item from "Stats" to "Dashboard" and make it the **first menu item** for Pros.

---

## Layout

- Two tabs: **My Performance** (default) and **Market & Comparison**
- Tab switching is client-side only — no full page reload
- Responsive for both desktop and mobile web

---

## Tab 1 — My Performance

### 1.1 Funnel Metrics (top of page)

Three summary cards, each showing current value + % delta vs. prior period:

| Metric | Definition |
|---|---|
| **Total Page Visitors** | Unique visitors (logged-in or anonymous) who loaded this pro's public profile page |
| **Neighbors** | Logged-in GigKraft users whose account zip code matches the pro's zip code, who visited the pro's profile |
| **Project Requests** | Total leads submitted to this pro |

**Conversion Rate**: automatically computed as `Project Requests / Total Page Visitors`, shown as a percentage below the three cards.

### 1.2 Timeline Visualization

Bar chart showing **Total Page Visitors** vs **Project Requests** over the selected time range, grouped by week.

**Range selector** (switcher above chart): `7 days` | `30 days` | `90 days`

The delta % on the summary cards also updates when the range changes.

### 1.3 Portfolio Asset Engagement

Per-Kraft engagement table below the chart:

| Column | Definition |
|---|---|
| Kraft title | Name of the portfolio item |
| Impressions | Count of times this Kraft card was rendered/visible on the pro's profile page (fires on page load) |
| Clicks | Count of times a visitor explicitly clicked/opened this Kraft item |
| Click-through rate | `Clicks / Impressions` as % |

Both anonymous and logged-in visitor interactions are captured.

---

## Tab 2 — Market & Comparison

### 2.1 Geographic Breakdown

Table segmenting the pro's **Total Page Visitors** and **Project Requests** by the visitor's zip code (captured at visit time when available).

### 2.2 Market Share Benchmark

Compares this pro's lead volume to other GigKraft pros in the **same zip code + same trade category**.

- **Minimum threshold**: requires at least **5 other pros** in the same zip + trade to show data
- If fewer than 5: show a **"Coming Soon"** state with the current count, e.g. *"2 of 5 pros needed in your area to unlock benchmarks"*
- When unlocked: show the pro's lead % vs. the regional average as a comparison bar or table

### 2.3 Partner Referrals

**Not in scope for this release.** Omit from UI entirely.

---

## Backend Tracking Events Required

Real events (not mocked) that must be stored to power the above metrics.

### Pro Profile Page View
Fire when any visitor loads a pro's public profile.

```
event: pro_profile_view
fields:
  - pro_id
  - viewer_user_id      (null if anonymous)
  - viewer_zip          (from logged-in user's account zip, null if anonymous)
  - timestamp
```

### Kraft Impression
Fire once per Kraft card rendered on the pro's profile page.

```
event: kraft_impression
fields:
  - kraft_id
  - pro_id
  - viewer_user_id      (null if anonymous)
  - timestamp
```

### Kraft Click
Fire when a visitor explicitly opens/clicks a Kraft item.

```
event: kraft_click
fields:
  - kraft_id
  - pro_id
  - viewer_user_id      (null if anonymous)
  - timestamp
```

---

## API Endpoints Required

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/pros/me/dashboard?range=30d` | Tab 1 data: funnel stats, timeline, per-Kraft engagement |
| `GET` | `/api/pros/me/market?range=30d` | Tab 2 data: zip breakdown, market share or coming-soon state |
| `POST` | `/api/pros/track/profile-view` | Records a profile page view (called from frontend on public profile load) |
| `POST` | `/api/pros/track/kraft-impression` | Records a Kraft card impression |
| `POST` | `/api/pros/track/kraft-click` | Records a Kraft click |

Range values: `7d`, `30d`, `90d`

---

## Tracking Behaviour — Decisions

- **Anonymous visitor zip**: always null. No geolocation.
- **Anonymous visitor counts**: still recorded against the pro's profile view total (contributes to "Total Page Visitors" and to GK Admin page popularity ranking).
- **GK Admin use**: the `pro_profile_view` event feeds a GK Admin view showing which pro profile pages are most visited across the platform (page popularity leaderboard). No additional event needed — same event, aggregated differently.
- **Event delivery**: fire-and-forget from the frontend. No retry on failure.

# GigKraft Design System

> Warm, rugged, hi-vis. A neo-brutalist trade-marketplace design language for **GigKraft.com** — the hyper-localized handyman portal where field proof beats star ratings.

---

## 1. Company & Product Context

**GigKraft.com** is a hyper-localized, decentralized marketplace connecting home-service technicians and modern tradespeople with nearby property emergencies. It runs on a network of independent **regional operational nodes** (e.g. `southwest-us-04`) rather than one global pool.

Its defining product decision is a **visual-first verification guardrail**: GigKraft throws out text-heavy business bios, résumé entries and unverified star ratings. Instead, a pro must upload a **mandatory "After" image** (the "Before" slot is optional) backed by a **confirmed regional invoice cost** — that's what establishes real field proof. Consumers browse *proof*, not prose.

Key mechanics:
- **Regional nodes** triage local demand; each has a Community Node Manager.
- **Cross-channel dispatch** — unrouted emergencies are blasted to proven local pros over native **SMS** and **WhatsApp** automation.
- **Micro-subscription** — tradespeople pay a flat **$19.99/month** to publish case studies and claim leads.
- **"Krafts"** — the in-app term for a published before/after case-study record.

### Products / surfaces represented
1. **GigKraft Mobile App** (warm cream, the primary surface) with three role tracks:
   - **Guest Gateway / Onboarding** — splash, role router, phone-OTP signup, paywall.
   - **Handyman Pro** — ops dashboard, "Add Kraft" case-study form, messenger, billing/vault.
   - **Consumer Client** — visual discovery feed, before/after proof detail, emergency broadcast, review.
2. **GigKraft Admin** — a desktop web console for the **Community Node Manager** (regional ops metrics, cross-channel triage desk, safety & hygiene moderation queue).

### Sources reviewed
- `uploads/gemini-code-1780459101087.html` — a full single-file interactive simulation of all four role tracks (mobile + desktop admin). **This is the primary source of truth** for tokens, components and copy; the brand design tokens live in its `:root`.
- `uploads/Gemini_Generated_Image_.png` — the hand-drawn brand mark (now `assets/gigkraft-logo.png`).
- User direction: *"warm earthly colors and rugged like a handyman."*

> No Figma file, repo, or codebase beyond the single HTML simulation was provided. UI-kit recreations below are built from that HTML's markup and tokens, not from screenshots.

---

## 2. Content Fundamentals

**Voice: confident field-ops dispatcher meets friendly neighbor.** Copy is punchy, action-first and a little swaggering, but always grounded in the physical job.

- **Casing.** Headlines use **Title Case** or sentence case in the friendly rounded display font ("Local Handyman Proof, Fast."). Eyebrows, badges and table headers are **UPPERCASE with letter-spacing** ("PENDING TRIAGE", "OPEN GIGS", "SCREEN 2 OF 4 • ONBOARDING").
- **Person.** Speaks **to "you"** as the pro/client ("Claim local leads", "See actual before/after invoices"). Marketplace mechanics are described in plain third person.
- **Trade vocabulary is a feature.** Lean into the jargon — *Kraft, node, triage, dispatch, vault, ledger, proof, resolder, rig, blast, pin*. The product literally calls a case study a **"Kraft"** and the billing screen a **"Vault."** Use these proper nouns.
- **Proof over promises.** Numbers are always concrete and verified: `Verified Job Invoice: $120.00`, `42 Pros`, `3 Leads`, `1.4 miles away`. Never vague ("highly rated"); always specific and locality-stamped.
- **Imperative CTAs.** Buttons are verbs + objects: "Enter Neighborhood Hub", "Claim Chat Routing", "Publish Portfolio Record", "Issue Verification Token", "Request Direct Quote From Pro". Money-bearing CTAs show the amount: "Activate Account ($19.99)".
- **Urgency & locality framing.** "Live Local Pro Triage Alerts", "Emergency Broadcast", "within your immediate zip code node". Speed and proximity are the recurring promises.
- **Emoji & symbols.** Emoji are used sparingly as **functional wayfinding glyphs** in nav/labels (🔧 trade pro, 🏠 hire, 📊 dashboard, ➕ Add Kraft, 💳 billing, 🔍 discover, 🚨 emergency, ⚡ live, 📍 location, ✨ "After"). Star glyphs `★★★★★` render ratings. They are UI furniture, not decoration — keep them single and purposeful.

**Example microcopy** (verbatim from source):
- *"Skip the reviews. See actual before/after invoices confirmed within your immediate zip code node."*
- *"Publish case studies & claim local leads for $19.99/mo."*
- *"CRITICAL FLOW RULE: … enforces a MANDATORY 'After' project image …"*

---

## 3. Visual Foundations

The look is **neo-brutalist trade-shop**: warm cream paper, heavy navy ink outlines, hard offset shadows that look stamped or printed, hi-vis safety accents, and soft rounded friendly type. Think work-order forms crossed with safety signage.

- **Color.** Warm-cream surfaces (`#FAF8F5`) carry the light experience; a near-black navy (`#0A2540`) is the universal ink for text, borders and shadows. **Electric Orange** (`#FF6B00`) is the single primary action color; **Hi-Vis Lime** (`#CCFF00`) is reserved for verification / "proof" / badge moments. The admin "command center" flips to a dark ground (`#0F172A`/`#1E293B`). A warm-earth extension (kraft tan, terracotta clay, timber brown) deepens the rugged direction. See `colors_and_type.css`.
- **Type.** Two rounded Google families: **Fredoka** for all display/headings and the wordmark (friendly, geometric, confident); **Quicksand** for body and UI (clean, rounded, legible at small sizes). Monospace (`Courier New`) appears only inside the developer "blueprint" code drawers. Headings are semi-bold and tight; eyebrows are uppercase tracked.
- **Borders.** Borders are a *primary* visual element, not a hairline afterthought: **2–3px solid navy** outlines on virtually every card, input, button and table. **Dashed navy** borders signal structure/dividers and **empty/optional upload wells**; dashed orange marks the **mandatory** "After" slot.
- **Shadows.** The signature is the **hard, un-blurred offset shadow** (`Npx Npx 0 navy`) — buttons, cards, badges and metric tiles sit on a crisp navy drop with **no blur**, like a printed sticker. Soft ambient blurred shadows (`0 10px 30px`) are used only for floating dark panels and device frames.
- **Corner radii.** Generously rounded throughout: small controls 6–8px, cards 12px, sheets/panels 18–24px, pills 999px, phone frame 42px. Nothing is sharp-cornered — the roundness offsets the heavy borders so it reads friendly, not severe.
- **Cards.** White surface, 2px navy border, ~12px radius, 2px-offset hard navy shadow, 12px padding. Selected/active cards swap the border to orange + a faint orange tint fill. "Hero"/premium cards invert to navy fill with lime text.
- **Backgrounds.** Flat warm color fields — **no gradients** on light surfaces. The brand mark sits on textured cream paper. Imagery is conceptually **before/after split panels**: a muted grey "before" beside a hi-vis lime "after." No photographic gradients, no glassmorphism on light; the dark admin uses subtle ambient shadow depth only.
- **Buttons & states.** Primary = orange fill, white text, navy border, 2px hard shadow. **Press state physically depresses**: `transform: translate(1px,1px)` while the shadow shrinks to 1px — the button visibly "stamps" down. Hover on dark tabs brightens border to orange. Secondary = white fill / navy text / navy border; destructive = red fill.
- **Animation.** Minimal and mechanical. Short `0.2s ease` transitions on interactive chrome (tabs, nav). The defining motion is the **tactile button press** (translate + shadow collapse), not fades or bounces. No looping/ambient animation.
- **Transparency & blur.** Used sparingly — faint color washes for selected states (`rgba(255,107,0,0.05)`), translucent white address fields on the navy browser bar. No heavy backdrop blur.
- **Layout rules.** Sticky top control/nav bars with an orange bottom-accent border. Mobile uses a fixed bottom tab bar (white, 2px navy top border). Generous 4px-based spacing. High-density data tables in admin with navy header rows and 1px row dividers.

---

## 4. Iconography

GigKraft has **no bundled icon font, SVG sprite or icon library** in the source — iconography is delivered entirely through **emoji used as functional glyphs**, plus Unicode star characters for ratings.

- **System:** native platform **emoji** stand in for icons across navigation, labels, badges and buttons. They are deployed as single, meaning-bearing wayfinding marks — never clustered or decorative.
- **Recurring glyph set:**
  - Roles: 🔒 guest · 👷‍♂️ handyman pro · 🏠 client · 🌐 node manager
  - Mobile nav: 📊 dashboard · ➕ Add Kraft · 💳 billing · 🔍 discover · 🚨 emergency
  - Status & action: ⚡ live/ops · 📡 cross-channel · ⚠️ safety/warning · 📍 location · ✨ "After" proof · 📷 "Before" · 🗄️ database · ● status dot
  - Ratings: Unicode `★★★★★`.
- **Logo:** the brand mark (`assets/gigkraft-logo.png`) is a **hand-drawn colored-pencil illustration** — a house flanked by crossed wrench + hammer, screwdriver corner ornaments, leaves and stars, with the "gigkraft" wordmark in navy rounded type and a "HANDYMAN PORTAL" subtitle, all on textured cream paper. This sketchbook quality is the soul of the brand; it is the one place hand-craft beats geometry.

**Recommendation / substitution flag:** for any *production* build needing scalable, accessible icons, adopt a single rounded-stroke set that matches the friendly geometry — **Lucide** (rounded line icons, CDN-available) is the closest fit to the Fredoka/Quicksand roundness. This would be a **substitution** (no icon set exists in the source); confirm before standardizing, and keep the emoji glyphs where the playful trade tone is wanted. No icon files were available to copy in.

---

## 5. File Index

Root:
- **`README.md`** — this file: context, content & visual foundations, iconography, index.
- **`colors_and_type.css`** — color tokens, type scale, spacing, shadows, radii, semantic type roles. Import this everywhere.
- **`SKILL.md`** — Agent-Skill manifest for using this system in Claude Code.
- **`assets/`** — brand mark (`gigkraft-logo.png`).
- **`preview/`** — Design System tab cards (colors, type, spacing, components, brand).

UI kits (`ui_kits/`):
- **`ui_kits/mobile-app/`** — the GigKraft mobile app (guest, pro, client tracks). `index.html` is an interactive click-through; JSX components for the phone frame, cards, buttons, inputs, tab bar, before/after proof, feed.
- **`ui_kits/web-admin/`** — the Community Node Manager desktop console. `index.html` is an interactive click-through; JSX components for browser shell, sidebar, metric tiles, data tables, triage actions.

> No slide template was provided in the source, so no `slides/` kit was created.

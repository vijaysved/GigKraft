# GigKraft Mobile App — UI Kit

High-fidelity, interactive recreation of the **GigKraft mobile app** (warm cream, neo-brutalist). Rebuilt from the brand tokens and markup in `uploads/gemini-code-1780459101087.html` — not from screenshots.

## Run
Open `index.html`. Use the top **role chips** (Guest · Handyman Pro · Consumer) to jump between the three tracks, or click through naturally.

## Click-through flow
- **Guest:** Splash → Role Router → Phone-OTP Signup → Pro Vault Paywall.
- **Handyman Pro** (tab bar 📊 ➕ 💳): Ops Dashboard → claim a lead opens the Messenger; Add Kraft enforces the **mandatory After image** (publish is blocked until it's filled); Billing/Vault.
- **Consumer** (tab bar 🔍 🚨): Discovery Feed → Before/After Proof detail → Request Quote → Verified Review; Emergency Broadcast desk.

## Files
- `index.html` — mounts the app; holds all kit CSS (classes prefixed `gk-`).
- `Primitives.jsx` — `GkButton`, `GkInput`, `GkCard`, `GkBadge`, `GkStatus`, `BeforeAfter`, `GkEyebrow`.
- `PhoneFrame.jsx` — device shell (notch, brand header, scroll area, bottom tab bar).
- `Screens.jsx` — all screens + `GkApp` state machine.

## Notes
- Components share scope via `Object.assign(window, …)` at the end of each file (multi-file Babel pattern).
- Interactions are cosmetic mocks (no real auth/payment/network).
- The brand mark is referenced from `../../assets/gigkraft-logo.png`.

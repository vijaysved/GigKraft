# GigKraft Admin Console — UI Kit

High-fidelity, interactive recreation of the **Community Node Manager** desktop console. Rebuilt from the brand tokens and markup in `uploads/gemini-code-1780459101087.html`.

## Run
Open `index.html`. Use the left sidebar to switch the three node-management views. Dispatch and moderation buttons fire toast confirmations.

## Views
- **⚡ Regional Core Ops** — KPI metric tiles (pending triage, active pros, monthly run rate) + a live node activity feed.
- **📡 Cross-Channel Desk** — emergency triage table with per-task **WhatsApp Blast** / **SMS Pin** dispatch actions.
- **⚠️ Safety & Hygiene** — verification compliance queue; Dismiss or Suspend resolves a row (queue clears when empty).

## Files
- `index.html` — mounts the app; holds all kit CSS (classes prefixed `ad-`).
- `AdminComponents.jsx` — `BrowserShell`, `Sidebar`, `MetricTile`, `SectionHead`, `InlineBtn`.
- `AdminViews.jsx` — the three views + `AdminApp` shell.

## Notes
- Desktop-optimized inside a browser-window chrome (navy top bar, traffic lights, address field).
- Components share scope via `Object.assign(window, …)`.
- Interactions are cosmetic mocks (no real dispatch/network).

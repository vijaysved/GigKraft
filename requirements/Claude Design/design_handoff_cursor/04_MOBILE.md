# 04 · Mobile — React Native (Expo) mapping

The two **mobile** tracks are React Native: **Handyman Pro (1.1–1.13)** and **Homeowner (2.1–2.6)** — **19 mobile screens**. The admin (3.x) is web only. Recreate the prototype's mobile UI as native React Native — don't embed the HTML or render it in a WebView.

> Why React Native (the "decide for me" pick): the prototypes are already React, so component structure, props and state map 1:1; and the web admin is also React/TS, so the team shares one language, one OpenAPI client generator, and shared domain types.

---

## 1. Project structure (`gigkraft-mobile/`)

```
src/
├─ theme/tokens.ts             # paste from 01_DESIGN_SYSTEM.md (palette, scheme, shadow…)
├─ theme/ThemeContext.tsx      # { scheme, mode, toggle }; persists mode in AsyncStorage
├─ api/                        # openapi-typescript types + openapi-fetch client + react-query hooks
├─ components/                 # shared primitives (build once)
│   ├─ GkButton.tsx  GkCard.tsx  GkField.tsx  GkSelect.tsx
│   ├─ GkSwitch.tsx  GkSegmented.tsx  GkChip.tsx  GkBadge.tsx
│   ├─ GkAvatar.tsx  GkStars.tsx  GkPhotoSlot.tsx  GkBeforeAfter.tsx
│   └─ PhoneScaffold.tsx       # app bar + scroll body + sticky footer + bottom tab
├─ features/pro/               # 13 screens + ProShell (bottom tabs)
└─ features/home/              # 6 screens + HomeShell (bottom tabs)
```

- **Navigation:** Expo Router (file-based) or React Navigation — two bottom-tab navigators (`ProShell`, `HomeShell`), each tab a stack. Center tab is a raised primary button (＋ Add Kraft / 🚨 Emergency).
- **Data:** `@tanstack/react-query` over an `openapi-fetch` client generated from the Ninja OpenAPI spec.
- **State:** local component state for forms/lists/chat; React Query cache for server data. Auth token in `expo-secure-store`; theme `mode` in `@react-native-async-storage/async-storage`.

---

## 2. Component → React Native mapping

| Prototype (kit.jsx) | React Native | Notes |
|---|---|---|
| `Btn` filled/light/default/subtle/danger | `GkButton` (`Pressable`) | 46px, radius 8, weight 600; `press` → opacity/scale 0.98 |
| `Card` | `GkCard` (`View`) | radius 14, 1px border, `shadow.sm`; `press` → wrap in `Pressable` |
| `TextInput`/`Textarea` | `GkField` (`TextInput`) | 46px (multiline grows); focus → tinted border; `keyboardType` per field |
| `Select` | `GkSelect` | `@gorhom/bottom-sheet` picker or platform `ActionSheet`/`Picker` |
| `Switch` | `Switch` (core) | `trackColor` active = blue |
| `Segmented` | `GkSegmented` | row of toggle pills; selected gets surface + shadow |
| `Chip` | `GkChip` (`Pressable`) | pill, toggles add/remove |
| `Badge` (blue/green/red/yellow) | `GkBadge` | uppercase 11px 700, pill |
| `Avatar` | `GkAvatar` | `Image` or initials; hue derived from name |
| `Stars` | `GkStars` | tappable for input (2.5), static elsewhere; Tabler star/star-filled, yellow |
| `Photo` | `GkPhotoSlot` | striped placeholder; `dashed` = optional/empty; tap → `expo-image-picker` → S3 presigned upload |
| **`BeforeAfter`** | `GkBeforeAfter` | 2-up; left "Before" grey, right "✦ After" green — the proof component |
| `BottomTab` | tab navigator `tabBar` | 5 items; center item raised primary button (＋ / 🚨) |
| `AppBar`/`Screen` | `PhoneScaffold` | `SafeAreaView` + sticky header + `ScrollView` body + sticky footer |
| `Steps` | progress bar row | onboarding 1.1–1.5 |
| `Stat`/`BarChart`/donut | small custom views or `react-native-svg` / `victory-native` | analytics 1.11, account stat strip 2.6 |
| `SwitchRow` | row + `Switch` | settings/notification toggles (2.6 dispatch alerts, 3.6-style) |

Icons: `@tabler/icons-react-native`. Fonts: `expo-font` + `@expo-google-fonts/manrope` + `@expo-google-fonts/jetbrains-mono` (apply mono to numbers, ZIPs, codes, money, timers, invoice IDs).

---

## 3. Mobile behaviors to reproduce

- **Onboarding (1.1–1.5)** — 5-step wizard with a progress bar and Skip; finishing publishes the pro into the node.
- **Mandatory After (1.6)** — the Publish button stays disabled until ≥1 After photo is added; the footer label changes to guide the user. Mirror the server rule.
- **Leads (1.9)** — response-time pills count down; turn red when urgent (< ~1h). Compute from `lead.respond_by`.
- **Chat (1.10 / 2.4)** — auto-scroll to newest; quote/invoice render as structured cards, not plain bubbles; accepting a quote (2.4) confirms via toast.
- **Emergency (2.3)** — broadcast success shows a pulsing indicator + live claim list. Poll or use a websocket for claim updates.
- **Account (2.6)** — saved-pro rows navigate to 2.2 (tap) or 2.4 (message icon); past-job rows deep-link to 2.5 to recommend; the three dispatch-alert switches PATCH `notif-prefs`.
- **Theme** — persist `mode`; swap the `scheme` object via `ThemeContext`. Toasts → a bottom-center snackbar (`react-native-toast-message` or custom), ~2.2s.
- **Device sizing** — the prototype renders at 390×844 inside a phone frame; that frame is *presentation only*. Your RN app fills the real device — build with flex + `SafeAreaView`, don't hardcode 390×844.

---

## 4. Parity checklist (per screen)
For each of the 19 mobile screens, verify against `design_reference/`:
- [ ] Layout matches (header/body/footer/tab structure)
- [ ] Exact copy and number values (or wired to API)
- [ ] Tones/badges/pills use the right semantic colors
- [ ] Empty / disabled / success states present where specified in 02_SCREENS.md
- [ ] Light + dark both correct

# 01 · Design System — Tokens, Mantine theme, React Native tokens

All values are final (hi-fi). The canonical source is `design_reference/styles.css` — this doc translates it into a Mantine theme (web admin) and a React Native token file (mobile) you can paste in directly.

---

## 1. Color tokens

### Brand / primary — Mantine **blue** scale
`#228be6` (blue-6) is the single primary action color.

```
blue: 0:#e7f5ff 1:#d0ebff 2:#a5d8ff 3:#74c0fc 4:#4dabf7
      5:#339af0 6:#228be6 7:#1c7ed6 8:#1971c2 9:#1864ab
```

### Neutral — Mantine **gray** (light) / **dark** scales
```
gray: 0:#f8f9fa 1:#f1f3f5 2:#e9ecef 3:#dee2e6 4:#ced4da
      5:#adb5bd 6:#868e96 7:#495057 8:#343a40 9:#212529
dark: 0:#c1c2c5 1:#a6a7ab 2:#909296 3:#5c5f66 4:#373a40
      5:#2c2e33 6:#25262b 7:#1a1b1e 8:#141517 9:#101113
```

### Semantic accents
| Role | Light | On-light text |
|---|---|---|
| Success / verified | bg `#ebfbee`, fg `#2b8a3e`, border `#b2f2bb` | green-6 `#2f9e44` |
| Danger / emergency | bg `#fff5f5`, fg `#c92a2a`, border `#ffc9c9` | red-6 `#e03131` |
| Warning / pending | bg `#fff9db`, fg `#e67700`, border `#ffec99` | yellow-6 `#f08c00` |
| Teal (homeowner brand) | `#0ca678` | — |
| WhatsApp | `#25d366` | — |

### Semantic surface roles (drive light/dark theming)
| Token | Light | Dark |
|---|---|---|
| `--bg` (app canvas) | `#f8f9fa` | `#101113` |
| `--surface` (card) | `#ffffff` | `#1a1b1e` |
| `--surface-2` / input | `#f8f9fa` | `#25262b` |
| `--border` | `#e9ecef` | `#2c2e33` |
| `--border-2` | `#dee2e6` | `#373a40` |
| `--text` | `#212529` | `#c1c2c5` |
| `--text-2` | `#495057` | `#a6a7ab` |
| `--text-3` (muted) | `#868e96` | `#909296` |
| `--tint` (primary bg) | `#e7f5ff` | `rgba(34,139,230,.15)` |

> In Mantine, prefer `light-dark()` / `var(--mantine-color-*)` and `[data-mantine-color-scheme]`. The mapping above tells you which Mantine token each custom role corresponds to.

---

## 2. Spacing, radius, type, shadow

```
Spacing  xs 8  sm 12  md 16  lg 20  xl 32           (4px base)
Radius   xs 4  sm 8   md 10  lg 14  xl 20  pill 999  (phone frame 52)
Font     UI 'Manrope'    Mono 'JetBrains Mono'
Sizes    xs 11  sm 13  md 15  lg 18  xl 22  2xl 28  3xl 34
Weights  400 / 500 / 600 / 700 / 800
Shadow   xs  0 1px 2px rgba(16,24,40,.06)
         sm  0 1px 3px rgba(16,24,40,.07)
         md  0 4px 12px rgba(16,24,40,.08)
         lg  0 12px 32px rgba(16,24,40,.12)
Motion   cubic-bezier(.4,0,.2,1); chrome transitions .15s
```

Shadows are **soft and blurred** (fintech-clean), not the hard offset shadows of the old brand. Borders are **1px hairlines** (`--border`), not heavy outlines.

---

## 3. Mantine `theme.ts` (paste into `web-admin/src/theme.ts`)

```ts
import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  primaryShade: { light: 6, dark: 6 },
  fontFamily: 'Manrope, system-ui, -apple-system, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, ui-monospace, monospace',
  defaultRadius: 'sm', // 8px
  radius: { xs: rem(4), sm: rem(8), md: rem(10), lg: rem(14), xl: rem(20) },
  spacing: { xs: rem(8), sm: rem(12), md: rem(16), lg: rem(20), xl: rem(32) },
  fontSizes: { xs: rem(11), sm: rem(13), md: rem(15), lg: rem(18), xl: rem(22) },
  headings: {
    fontFamily: 'Manrope, sans-serif',
    sizes: {
      h1: { fontSize: rem(28), fontWeight: '800', lineHeight: '1.2' },
      h2: { fontSize: rem(22), fontWeight: '800', lineHeight: '1.25' },
      h3: { fontSize: rem(18), fontWeight: '700', lineHeight: '1.3' },
    },
  },
  shadows: {
    xs: '0 1px 2px rgba(16,24,40,.06), 0 1px 1px rgba(16,24,40,.04)',
    sm: '0 1px 3px rgba(16,24,40,.07), 0 1px 2px rgba(16,24,40,.04)',
    md: '0 4px 12px rgba(16,24,40,.08), 0 2px 4px rgba(16,24,40,.04)',
    lg: '0 12px 32px rgba(16,24,40,.12), 0 4px 8px rgba(16,24,40,.05)',
  },
  components: {
    Button:    { defaultProps: { radius: 'sm' }, styles: { root: { fontWeight: 600, height: rem(46) } } },
    Card:      { defaultProps: { radius: 'lg', withBorder: true, shadow: 'xs', padding: 'md' } },
    Paper:     { defaultProps: { radius: 'lg', withBorder: true } },
    TextInput: { defaultProps: { radius: 'sm', size: 'md' } },
    Select:    { defaultProps: { radius: 'sm', size: 'md' } },
    Badge:     { defaultProps: { radius: 'sm', variant: 'light' } },
    Table:     { defaultProps: { verticalSpacing: 'sm', horizontalSpacing: 'md' } },
  },
});
```

Wrap the app: `<MantineProvider theme={theme} defaultColorScheme="light">`. Load Manrope + JetBrains Mono via `@fontsource` or a Google Fonts `<link>`. Color-scheme toggle uses `useMantineColorScheme()`.

### Custom CSS vars (for non-Mantine bits — charts, tints)
Add these to a global stylesheet so chart fills and tint backgrounds match:
```css
:root { --tint: var(--mantine-color-blue-0); --tint-text: var(--mantine-color-blue-8); }
[data-mantine-color-scheme="dark"] { --tint: rgba(34,139,230,.15); --tint-text: var(--mantine-color-blue-3); }
```

---

## 4. React Native `tokens.ts` (paste into `gigkraft-mobile/src/theme/tokens.ts`)

No Mantine on mobile — these are plain TS tokens consumed by your `Gk*` primitives and a `ThemeContext` that swaps the `scheme` object on light/dark.

```ts
// src/theme/tokens.ts
export const palette = {
  blue:   '#228BE6', // primary action
  blue7:  '#1C7ED6',
  teal:   '#0CA678', // homeowner accent
  green:  '#2F9E44',
  red:    '#E03131',
  yellow: '#F08C00',
  whatsapp: '#25D366',
} as const;

export const radius  = { sm: 8, md: 10, lg: 14, xl: 20, pill: 999 } as const;
export const spacing = { xs: 8, sm: 12, md: 16, lg: 20, xl: 32 } as const;
export const font = { ui: 'Manrope', mono: 'JetBrainsMono' } as const;
export const fontSize = { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, '2xl': 28, '3xl': 34 } as const;
export const weight = { regular: '400', medium: '500', semibold: '600', bold: '700', black: '800' } as const;

// Soft, blurred elevation (RN: use shadow* on iOS, elevation on Android)
export const shadow = {
  sm: { shadowColor: '#101828', shadowOpacity: 0.07, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  md: { shadowColor: '#101828', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  lg: { shadowColor: '#101828', shadowOpacity: 0.12, shadowRadius: 32, shadowOffset: { width: 0, height: 12 }, elevation: 8 },
} as const;

// Surface roles — swap the whole object on color scheme.
export type Scheme = typeof light;
export const light = {
  bg: '#F8F9FA', surface: '#FFFFFF', surface2: '#F8F9FA',
  border: '#E9ECEF', border2: '#DEE2E6',
  text: '#212529', text2: '#495057', text3: '#868E96',
  tint: '#E7F5FF', tintText: '#1971C2',
  green: '#2B8A3E', greenBg: '#EBFBEE', greenBd: '#B2F2BB',
  red: '#C92A2A', redBg: '#FFF5F5', redBd: '#FFC9C9',
  yellow: '#E67700', yellowBg: '#FFF9DB',
} as const;
export const dark: Scheme = {
  bg: '#101113', surface: '#1A1B1E', surface2: '#25262B',
  border: '#2C2E33', border2: '#373A40',
  text: '#C1C2C5', text2: '#A6A7AB', text3: '#909296',
  tint: 'rgba(34,139,230,0.15)', tintText: '#74C0FC',
  green: '#69DB7C', greenBg: 'rgba(47,158,68,0.15)', greenBd: 'rgba(47,158,68,0.4)',
  red: '#FF8787', redBg: 'rgba(224,49,49,0.15)', redBd: 'rgba(224,49,49,0.4)',
  yellow: '#FFD43B', yellowBg: 'rgba(240,140,0,0.15)',
} as const;
```

Provide a `ThemeContext` (`{ scheme, mode, toggle }`) at the app root; persist `mode` with `@react-native-async-storage/async-storage` and seed from `useColorScheme()`. Load fonts with `expo-font` (`@expo-google-fonts/manrope`, `@expo-google-fonts/jetbrains-mono`). Apply `font.mono` to numbers, ZIPs, codes, money, response timers and invoice IDs.

---

## 5. Shared primitives (build these once, both platforms)

These exist in the prototype as `design_reference/screens/_shared/kit.jsx` (mobile) and `kit-admin.jsx` (desktop). Recreate them as real components before building screens:

| Primitive | Web (Mantine) | React Native | Notes |
|---|---|---|---|
| Button | `Button` (filled/light/default/subtle + `color="red"`) | `GkButton` (`Pressable`) | 46px tall, radius 8, weight 600 |
| Card / Paper | `Card` / `Paper` | `GkCard` (`View`) | radius 14, 1px border, shadow sm |
| TextInput / Textarea / Select | `TextInput`/`Textarea`/`Select` | `GkField` (`TextInput`) | 46px, radius 8, focus ring = tinted border |
| Switch | `Switch` | `Switch` (RN core) | active = blue |
| SegmentedControl | `SegmentedControl` | `GkSegmented` | row of toggle pills |
| Chip / Badge | `Chip` / `Badge` | `GkChip` / `GkBadge` | pill, tones: blue/green/red/yellow |
| Avatar | `Avatar` | `GkAvatar` | initials fallback, hue from name |
| Stars | custom | `GkStars` | Tabler star/star-filled, yellow |
| **Photo slot** | custom dropzone | `GkPhotoSlot` (`expo-image-picker`) | striped placeholder; dashed = optional/empty |
| **BeforeAfter** | custom | `GkBeforeAfter` | 2-up; "Before" grey, "✦ After" green — **core proof component** |
| Phone scaffold | n/a | `PhoneScaffold` (`SafeAreaView`) | app bar + scroll body + footer + bottom tab |
| Browser chrome | custom | n/a (admin is web) | traffic lights + URL bar |
| MetricTile / Panel / Pill / DataTable / Donut / Bars | custom + Mantine `Table` | n/a (admin is web) | admin desktop only |
```

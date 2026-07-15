import { createTheme, rem, type MantineThemeOverride } from "@mantine/core";

export type ThemeId =
  | "coral_tide"
  | "blackout_yellow"
  | "neon_trendsetter"
  | "sunset_blaze"
  | "pop_fizz"
  | "midnight_glow";

export interface ThemeBrandTokens {
  bgCanvas: string;
  bgSurface: string;
  bgSidebar: string;
  bgSidebarActive: string;
  brandGradient: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  textOnSidebar: string;
  textMuted: string;
  border: string;
  cardHero: string;
  useWallpaper: boolean;
}

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  tagline: string;
  description: string;
  colorScheme: "light" | "dark";
  swatchColors: string[];
  brand: ThemeBrandTokens;
  theme: MantineThemeOverride;
}

function mantineScale(steps: [string, string, string, string, string, string, string, string, string, string]) {
  return steps;
}

// Coral Reef — coral action color (Coral Tide theme)
const coralReef = mantineScale([
  "#FFEEEC", "#FFD4D0", "#FFB7B0", "#FF9A90", "#FF8579",
  "#FF6F61", "#E06255", "#BF5349", "#9E453C", "#803831",
]);

// Sunshine Yellow — action color (Blackout Yellow theme)
const sunshineYellow = mantineScale([
  "#FFFAE0", "#FFF2B3", "#FFEA80", "#FFE14D", "#FFDA26",
  "#FFD400", "#E0BB00", "#BF9F00", "#9E8300", "#806A00",
]);

// Hot Pink — action color (Neon Trendsetter theme)
const hotPink = mantineScale([
  "#FFE4F3", "#FFBCE1", "#FF8FCE", "#FF62BA", "#FF40AB",
  "#FF1E9C", "#E01A89", "#BF1775", "#9E1361", "#800F4E",
]);

// Golden Amber — action color (Sunset Blaze theme)
const goldenAmber = mantineScale([
  "#FFF8E0", "#FFEEB3", "#FFE380", "#FFD84D", "#FFCF26",
  "#FFC700", "#E0AF00", "#BF9500", "#9E7B00", "#806400",
]);

// Pool Cyan — action color (Pop Fizz theme)
const poolCyan = mantineScale([
  "#E0FBFF", "#B3F6FF", "#80F0FF", "#4DE9FF", "#26E5FF",
  "#00E0FF", "#00C5E0", "#00A8BF", "#008B9E", "#007080",
]);

// Glow Cyan — action color (Midnight Glow theme, dark)
const glowCyan = mantineScale([
  "#EDFCFF", "#D1F7FF", "#B3F1FF", "#94EBFF", "#7DE7FF",
  "#66E3FF", "#4FB2C9", "#3C8A9E", "#296373", "#19414F",
]);

const sharedBase: MantineThemeOverride = {
  fontFamily: "Manrope, system-ui, -apple-system, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
  defaultRadius: "lg",
  radius: {
    xs: rem(4), sm: rem(8), md: rem(12), lg: rem(16), xl: rem(24),
  },
  spacing: {
    xs: rem(8), sm: rem(12), md: rem(16), lg: rem(20), xl: rem(32),
  },
  fontSizes: {
    xs: rem(11), sm: rem(13), md: rem(15), lg: rem(18), xl: rem(22),
  },
  headings: {
    fontFamily: "Manrope, sans-serif",
    fontWeight: "800",
    sizes: {
      h1: { fontSize: rem(28), lineHeight: "1.15" },
      h2: { fontSize: rem(22), lineHeight: "1.2" },
      h3: { fontSize: rem(18), lineHeight: "1.3" },
    },
  },
  shadows: {
    xs: "0 2px 4px rgba(0,0,0,.06)",
    sm: "0 4px 12px rgba(0,0,0,.08)",
    md: "0 8px 24px rgba(0,0,0,.1)",
    lg: "0 16px 40px rgba(0,0,0,.14)",
  },
  components: {
    Button: {
      defaultProps: { radius: "xl" },
      vars: () => ({
        root: {
          "--button-bg": "var(--gk-accent-secondary)",
          "--button-hover": "var(--gk-accent-secondary)",
          "--button-color": "var(--gk-accent-primary)",
        },
      }),
      styles: { root: { fontWeight: 700, height: rem(46) } },
    },
    Card: { defaultProps: { radius: "lg", withBorder: true, shadow: "sm", padding: "md" } },
    Badge: { defaultProps: { radius: "md", variant: "light" } },
    TextInput: { defaultProps: { radius: "md", size: "md" } },
  },
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  coral_tide: {
    id: "coral_tide",
    label: "Coral Tide",
    tagline: "Coral Reef & Deep Teal",
    description: "Crisp white canvas with a deep teal header and warm coral action buttons — an eye-catching duo.",
    colorScheme: "light",
    swatchColors: ["#FF6F61", "#17A398", "#FFFFFF", "#0F7A70", "#FFEEEC"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAFAFA",
      bgSidebar: "#17A398",
      bgSidebarActive: "#FF6F61",
      brandGradient: "linear-gradient(135deg, #17A398 0%, #FF6F61 100%)",
      accentPrimary: "#FF6F61",
      accentSecondary: "#17A398",
      accentTertiary: "#0F7A70",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#E3EDEC",
      cardHero: "#17A398",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "coralReef",
      primaryShade: 5,
      colors: { coralReef },
    }),
  },

  blackout_yellow: {
    id: "blackout_yellow",
    label: "Blackout Yellow",
    tagline: "Jet Black, Pure White & Sunshine Yellow",
    description: "Pure white canvas with a jet-black header and high-contrast sunshine yellow action buttons.",
    colorScheme: "light",
    swatchColors: ["#0A0A0A", "#FFD400", "#FFFFFF", "#1A1A1A", "#FFFAE0"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FFFFFF",
      bgSidebar: "#0A0A0A",
      bgSidebarActive: "#FFD400",
      brandGradient: "linear-gradient(135deg, #0A0A0A 0%, #FFD400 100%)",
      accentPrimary: "#FFD400",
      accentSecondary: "#0A0A0A",
      accentTertiary: "#1A1A1A",
      textOnSidebar: "#FFFFFF",
      textMuted: "#666666",
      border: "#DDDDDD",
      cardHero: "#0A0A0A",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "sunshineYellow",
      primaryShade: 5,
      colors: { sunshineYellow },
    }),
  },

  neon_trendsetter: {
    id: "neon_trendsetter",
    label: "Neon Trendsetter",
    tagline: "Hot Pink, Orchid Magenta & Electric Violet",
    description: "Bright white canvas with an electric violet header and hot pink action buttons, for trend setters.",
    colorScheme: "light",
    swatchColors: ["#FF1E9C", "#C532E0", "#7B2FE0", "#FFFFFF", "#F5EBFF"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAF8FF",
      bgSidebar: "#7B2FE0",
      bgSidebarActive: "#FF1E9C",
      brandGradient: "linear-gradient(135deg, #7B2FE0 0%, #C532E0 50%, #FF1E9C 100%)",
      accentPrimary: "#FF1E9C",
      accentSecondary: "#7B2FE0",
      accentTertiary: "#C532E0",
      textOnSidebar: "#FFFFFF",
      textMuted: "#8A7A9E",
      border: "#EDE0FA",
      cardHero: "#7B2FE0",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "hotPink",
      primaryShade: 5,
      colors: { hotPink },
    }),
  },

  sunset_blaze: {
    id: "sunset_blaze",
    label: "Sunset Blaze",
    tagline: "Golden Amber, Marmalade & Burnt Sienna",
    description: "Warm cream canvas with a burnt sienna header and golden amber action buttons — sunset vibes.",
    colorScheme: "light",
    swatchColors: ["#FFC700", "#FFA83C", "#E8790A", "#FFF9F0"],
    brand: {
      bgCanvas: "#FFF9F0",
      bgSurface: "#FFFFFF",
      bgSidebar: "#E8790A",
      bgSidebarActive: "#FFC700",
      brandGradient: "linear-gradient(135deg, #E8790A 0%, #FFA83C 50%, #FFC700 100%)",
      accentPrimary: "#FFC700",
      accentSecondary: "#E8790A",
      accentTertiary: "#FFA83C",
      textOnSidebar: "#FFF8F2",
      textMuted: "#9A7A55",
      border: "#F5DFC0",
      cardHero: "#E8790A",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "goldenAmber",
      primaryShade: 5,
      colors: { goldenAmber },
    }),
  },

  pop_fizz: {
    id: "pop_fizz",
    label: "Pop Fizz",
    tagline: "Spring Green, Pool Cyan & Neon Magenta",
    description: "Crisp white canvas with a neon magenta header and pool cyan action buttons that make it pop.",
    colorScheme: "light",
    swatchColors: ["#00E28D", "#00E0FF", "#F400EB", "#FFFFFF"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAFAFA",
      bgSidebar: "#F400EB",
      bgSidebarActive: "#00E0FF",
      brandGradient: "linear-gradient(135deg, #00E28D 0%, #00E0FF 50%, #F400EB 100%)",
      accentPrimary: "#00E0FF",
      accentSecondary: "#F400EB",
      accentTertiary: "#00E28D",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#DFF7FA",
      cardHero: "#F400EB",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "poolCyan",
      primaryShade: 5,
      colors: { poolCyan },
    }),
  },

  midnight_glow: {
    id: "midnight_glow",
    label: "Midnight Glow",
    tagline: "Indigo Violet & Glow Cyan on Midnight Navy",
    description: "Midnight navy canvas with an indigo violet header and glowing cyan action buttons.",
    colorScheme: "dark",
    swatchColors: ["#0B0D12", "#7B5CFF", "#66E3FF", "#FF6BD6"],
    brand: {
      bgCanvas: "#0B0D12",
      bgSurface: "#151822",
      bgSidebar: "#7B5CFF",
      bgSidebarActive: "#66E3FF",
      brandGradient: "linear-gradient(135deg, #7B5CFF 0%, #66E3FF 100%)",
      accentPrimary: "#66E3FF",
      accentSecondary: "#7B5CFF",
      accentTertiary: "#FF6BD6",
      textOnSidebar: "#F5F7FF",
      textMuted: "#8C93A6",
      border: "#262B3A",
      cardHero: "#7B5CFF",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "glowCyan",
      primaryShade: 5,
      colors: { glowCyan },
    }),
  },
};

export const DEFAULT_THEME_ID: ThemeId = "blackout_yellow";

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  handyman: "pop_fizz",
  gigkraft_light: "pop_fizz",
  gigkraft_brand: "pop_fizz",
  influencer: "midnight_glow",
  gigkraft_dark: "midnight_glow",
  dark: "midnight_glow",
  podcast: "neon_trendsetter",
  warm_light: "neon_trendsetter",
  blueprint: "neon_trendsetter",
  outreach: "sunset_blaze",
  cool_light: "sunset_blaze",
  lime_n_orange: "sunset_blaze",
};

export function isThemeId(value: string | null): value is ThemeId {
  return value !== null && value in THEMES;
}

export function resolveThemeId(value: string | null): ThemeId {
  if (isThemeId(value)) return value;
  if (value !== null && value in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[value];
  return DEFAULT_THEME_ID;
}

export function applyBrandTokens(themeId: ThemeId): void {
  const { brand } = THEMES[themeId];
  const root = document.documentElement;
  root.dataset.gkTheme = themeId;
  root.style.setProperty("--gk-bg-canvas", brand.bgCanvas);
  root.style.setProperty("--gk-bg-surface", brand.bgSurface);
  root.style.setProperty("--gk-bg-sidebar", brand.bgSidebar);
  root.style.setProperty("--gk-bg-sidebar-active", brand.bgSidebarActive);
  root.style.setProperty("--gk-brand-gradient", brand.brandGradient);
  root.style.setProperty("--gk-accent-primary", brand.accentPrimary);
  root.style.setProperty("--gk-accent-secondary", brand.accentSecondary);
  root.style.setProperty("--gk-accent-tertiary", brand.accentTertiary);
  root.style.setProperty("--gk-text-sidebar", brand.textOnSidebar);
  root.style.setProperty("--gk-text-muted", brand.textMuted);
  root.style.setProperty("--gk-border", brand.border);
  root.style.setProperty("--gk-card-hero", brand.cardHero);
}

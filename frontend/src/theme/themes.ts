import { createTheme, rem, type MantineThemeOverride } from "@mantine/core";

export type ThemeId =
  | "gigkraft_brand"
  | "blueprint"
  | "warm_light"
  | "cool_light"
  | "gigkraft_dark";

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

// Electric Watermelon — electric cyan buttons
const electricCyan = mantineScale([
  "#e0fafe", "#b3f4fd", "#80edfb", "#4de6f9", "#26e1f8",
  "#00E5FF", "#00BDD4", "#0094A9", "#006C7E", "#004453",
]);

// Acid Lime Drop — neon lime buttons
const acidLime = mantineScale([
  "#f5ffe0", "#e6ffb3", "#d7ff80", "#c7ff4d", "#bcff26",
  "#7CFF00", "#65D400", "#4FAA00", "#3A7F00", "#265500",
]);

// Hyper-Pop Punch — magenta-pink buttons
const hyperMagenta = mantineScale([
  "#ffe6f8", "#ffb3ec", "#ff80e0", "#ff4dd4", "#ff26cb",
  "#FF00CC", "#D400AB", "#AA0089", "#7F0067", "#550045",
]);

// Plasma Tangerine — cobalt blue buttons
const plasmaBlue = mantineScale([
  "#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa",
  "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A",
]);

// Cyber Grapefruit — grapefruit red buttons
const cyberGrapefruit = mantineScale([
  "#ffe8e8", "#ffc5c5", "#ff9d9d", "#ff7474", "#ff6060",
  "#FF4E4E", "#E03C3C", "#C12A2A", "#A31A1A", "#840A0A",
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
      defaultProps: { radius: "md" },
      styles: { root: { fontWeight: 700, height: rem(46) } },
    },
    Card: { defaultProps: { radius: "lg", withBorder: true, shadow: "sm", padding: "md" } },
    Badge: { defaultProps: { radius: "md", variant: "light" } },
    TextInput: { defaultProps: { radius: "md", size: "md" } },
  },
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  gigkraft_brand: {
    id: "gigkraft_brand",
    label: "Electric Watermelon",
    tagline: "Bold energy, pure white canvas",
    description: "Pure white canvas with a hyper-vibrant pink header and electric cyan gradient buttons.",
    colorScheme: "light",
    swatchColors: ["#FF0055", "#00E5FF", "#00C8FF", "#FFFFFF", "#F0F0F0"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAFAFA",
      bgSidebar: "#FF0055",
      bgSidebarActive: "#00C8FF",
      brandGradient: "linear-gradient(135deg, #00E5FF 0%, #00C8FF 100%)",
      accentPrimary: "#00E5FF",
      accentSecondary: "#FF0055",
      accentTertiary: "#00C8FF",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#E5E5E5",
      cardHero: "#FF0055",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "electricCyan",
      primaryShade: 5,
      colors: { electricCyan },
    }),
  },

  blueprint: {
    id: "blueprint",
    label: "Acid Lime Drop",
    tagline: "Digital cobalt meets neon lime",
    description: "Stark white base with deep digital-cobalt header and high-vis neon acid lime action buttons.",
    colorScheme: "light",
    swatchColors: ["#0055FF", "#7CFF00", "#FFFFFF", "#003ECC", "#E8FFB3"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAFAFA",
      bgSidebar: "#0055FF",
      bgSidebarActive: "#7CFF00",
      brandGradient: "linear-gradient(135deg, #0055FF 0%, #7CFF00 100%)",
      accentPrimary: "#7CFF00",
      accentSecondary: "#0055FF",
      accentTertiary: "#003ECC",
      textOnSidebar: "#FFFFFF",
      textMuted: "#666666",
      border: "#E5E5E5",
      cardHero: "#0055FF",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "acidLime",
      primaryShade: 5,
      colors: { acidLime },
    }),
  },

  warm_light: {
    id: "warm_light",
    label: "Hyper-Pop Punch",
    tagline: "Structured purple, pop magenta",
    description: "Bright white-indigo sheen with structured dark purple header and energetic magenta-pink accents.",
    colorScheme: "light",
    swatchColors: ["#7900FF", "#FF00CC", "#F0EEFF", "#5A00BF", "#FFE6F8"],
    brand: {
      bgCanvas: "#F0EEFF",
      bgSurface: "#FFFFFF",
      bgSidebar: "#7900FF",
      bgSidebarActive: "#FF00CC",
      brandGradient: "linear-gradient(135deg, #7900FF 0%, #FF00CC 100%)",
      accentPrimary: "#FF00CC",
      accentSecondary: "#7900FF",
      accentTertiary: "#5A00BF",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#E0D8FF",
      cardHero: "#7900FF",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "hyperMagenta",
      primaryShade: 5,
      colors: { hyperMagenta },
    }),
  },

  cool_light: {
    id: "cool_light",
    label: "Plasma Tangerine",
    tagline: "Burning tangerine, cobalt action",
    description: "Crisp white background with burning tangerine header and solid vibrant cobalt buttons.",
    colorScheme: "light",
    swatchColors: ["#FF5E00", "#3B82F6", "#FFFFFF", "#CC4B00", "#DBEAFE"],
    brand: {
      bgCanvas: "#FFFFFF",
      bgSurface: "#FAFAFA",
      bgSidebar: "#FF5E00",
      bgSidebarActive: "#3B82F6",
      brandGradient: "linear-gradient(135deg, #FF5E00 0%, #3B82F6 100%)",
      accentPrimary: "#3B82F6",
      accentSecondary: "#FF5E00",
      accentTertiary: "#2563EB",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#E5E5E5",
      cardHero: "#FF5E00",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "plasmaBlue",
      primaryShade: 5,
      colors: { plasmaBlue },
    }),
  },

  gigkraft_dark: {
    id: "gigkraft_dark",
    label: "Cyber Grapefruit",
    tagline: "Digital violet, glowing grapefruit",
    description: "Fresh tinted-coral canvas with digital violet header and glowing grapefruit action items.",
    colorScheme: "light",
    swatchColors: ["#7000FF", "#FF4E4E", "#FFF0EE", "#5500CC", "#FFD0CC"],
    brand: {
      bgCanvas: "#FFF0EE",
      bgSurface: "#FFFFFF",
      bgSidebar: "#7000FF",
      bgSidebarActive: "#FF4E4E",
      brandGradient: "linear-gradient(135deg, #7000FF 0%, #FF4E4E 100%)",
      accentPrimary: "#FF4E4E",
      accentSecondary: "#7000FF",
      accentTertiary: "#5500CC",
      textOnSidebar: "#FFFFFF",
      textMuted: "#888888",
      border: "#F0D8D5",
      cardHero: "#7000FF",
      useWallpaper: false,
    },
    theme: createTheme({
      ...sharedBase,
      primaryColor: "cyberGrapefruit",
      primaryShade: 5,
      colors: { cyberGrapefruit },
    }),
  },
};

export const DEFAULT_THEME_ID: ThemeId = "gigkraft_brand";

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  handyman: "gigkraft_brand",
  gigkraft_light: "gigkraft_brand",
  influencer: "gigkraft_dark",
  podcast: "warm_light",
  outreach: "cool_light",
  dark: "gigkraft_dark",
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

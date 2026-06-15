// Four named themes (3 light + 1 dark). Surface-role values for the
// canonical light/dark schemes come from design_handoff_cursor/01_DESIGN_SYSTEM.md.
// warm_light and cool_light are tonal variants of the light scheme; the
// primary action color stays Mantine blue-6 across all themes.

export type ThemeName =
  | 'gigkraft_light'
  | 'warm_light'
  | 'cool_light'
  | 'gigkraft_dark';

export interface Scheme {
  /** Whether status bar/content should render for a dark background. */
  dark: boolean;
  /** Primary action color. */
  primary: string;
  /** Pressed/active primary. */
  primaryPressed: string;
  /** Text rendered on top of primary. */
  onPrimary: string;
  /** App canvas. */
  bg: string;
  /** Card surface. */
  surface: string;
  /** Secondary surface / input background. */
  surface2: string;
  border: string;
  border2: string;
  text: string;
  text2: string;
  text3: string;
  /** Primary tint background. */
  tint: string;
  /** Text on tint background. */
  tintText: string;
  green: string;
  greenBg: string;
  greenBd: string;
  red: string;
  redBg: string;
  redBd: string;
  yellow: string;
  yellowBg: string;
}

const lightBase = {
  dark: false,
  primary: '#228BE6',
  primaryPressed: '#1C7ED6',
  onPrimary: '#FFFFFF',
  bg: '#F8F9FA',
  surface: '#FFFFFF',
  surface2: '#F8F9FA',
  border: '#E9ECEF',
  border2: '#DEE2E6',
  text: '#212529',
  text2: '#495057',
  text3: '#868E96',
  tint: '#E7F5FF',
  tintText: '#1971C2',
  green: '#2B8A3E',
  greenBg: '#EBFBEE',
  greenBd: '#B2F2BB',
  red: '#C92A2A',
  redBg: '#FFF5F5',
  redBd: '#FFC9C9',
  yellow: '#E67700',
  yellowBg: '#FFF9DB',
} satisfies Scheme;

export const themes: Record<ThemeName, Scheme> = {
  gigkraft_light: lightBase,

  // Warm canvas variant: subtly warm neutrals, same blue primary.
  warm_light: {
    ...lightBase,
    bg: '#FAF8F4',
    surface2: '#FAF8F4',
    border: '#EEEAE2',
    border2: '#E3DDD2',
    text: '#26221C',
    text2: '#4F4A41',
    text3: '#8C857A',
    tint: '#FDF1E3',
    tintText: '#B25E09',
  },

  // Cool canvas variant: subtly cool neutrals with a teal tint accent.
  cool_light: {
    ...lightBase,
    bg: '#F4F8FA',
    surface2: '#F4F8FA',
    border: '#E2EBEF',
    border2: '#D3E0E6',
    text: '#1D2528',
    text2: '#425055',
    text3: '#7C8B91',
    tint: '#E0F5F0',
    tintText: '#087F5B',
  },

  gigkraft_dark: {
    dark: true,
    primary: '#228BE6',
    primaryPressed: '#1C7ED6',
    onPrimary: '#FFFFFF',
    bg: '#101113',
    surface: '#1A1B1E',
    surface2: '#25262B',
    border: '#2C2E33',
    border2: '#373A40',
    text: '#C1C2C5',
    text2: '#A6A7AB',
    text3: '#909296',
    tint: 'rgba(34,139,230,0.15)',
    tintText: '#74C0FC',
    green: '#69DB7C',
    greenBg: 'rgba(47,158,68,0.15)',
    greenBd: 'rgba(47,158,68,0.4)',
    red: '#FF8787',
    redBg: 'rgba(224,49,49,0.15)',
    redBd: 'rgba(224,49,49,0.4)',
    yellow: '#FFD43B',
    yellowBg: 'rgba(240,140,0,0.15)',
  },
};

export const THEME_NAMES = Object.keys(themes) as ThemeName[];

export const THEME_LABELS: Record<ThemeName, string> = {
  gigkraft_light: 'GigKraft Light',
  warm_light: 'Warm Light',
  cool_light: 'Cool Light',
  gigkraft_dark: 'GigKraft Dark',
};

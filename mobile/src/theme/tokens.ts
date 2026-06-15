// Design tokens translated from design_handoff_cursor/01_DESIGN_SYSTEM.md.
// Plain TS tokens consumed by the Gk* primitives and ThemeContext.

export const palette = {
  blue: '#228BE6', // primary action (Mantine blue-6)
  blue7: '#1C7ED6',
  teal: '#0CA678', // homeowner accent
  green: '#2F9E44',
  red: '#E03131',
  yellow: '#F08C00',
  whatsapp: '#25D366',
} as const;

export const radius = { xs: 4, sm: 8, md: 10, lg: 14, xl: 20, pill: 999 } as const;

export const spacing = { xs: 8, sm: 12, md: 16, lg: 20, xl: 32 } as const;

export const font = {
  ui: 'Manrope_400Regular',
  uiMedium: 'Manrope_500Medium',
  uiSemibold: 'Manrope_600SemiBold',
  uiBold: 'Manrope_700Bold',
  uiBlack: 'Manrope_800ExtraBold',
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const;

export const weight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;

// Soft, blurred elevation (shadow* on iOS, elevation on Android).
export const shadow = {
  sm: {
    shadowColor: '#101828',
    shadowOpacity: 0.07,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#101828',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: '#101828',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

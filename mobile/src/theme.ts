export const colors = {
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  card: '#1e293b',
  surface: '#1e293b',
  border: '#64748b',
  input: '#475569',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  textDisabled: '#64748b',
  primary: '#0ea5e9',
  primaryLight: '#7dd3fc',
  primaryDark: '#0369a1',
  secondary: '#a855f7',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  white: '#ffffff',
  black: '#020617',
} as const;

export const nestedColors = {
  primary: {
    300: colors.primaryLight,
    500: colors.primary,
    700: colors.primaryDark,
  },
  secondary: {
    500: colors.secondary,
  },
  success: {
    light: '#86efac',
    main: colors.success,
    dark: '#15803d',
    300: '#86efac',
    500: colors.success,
    700: '#15803d',
  },
  error: {
    light: '#f87171',
    main: colors.error,
    dark: '#b91c1c',
    300: '#f87171',
    500: colors.error,
    700: '#b91c1c',
  },
  warning: {
    light: '#fbbf24',
    main: colors.warning,
    dark: '#b45309',
    300: '#fbbf24',
    500: colors.warning,
    700: '#b45309',
  },
  info: {
    light: '#67e8f9',
    main: colors.info,
    dark: '#0e7490',
    300: '#67e8f9',
    500: colors.info,
    700: '#0e7490',
  },
  background: {
    primary: colors.background,
    secondary: colors.backgroundSecondary,
    tertiary: colors.backgroundTertiary,
    elevated: colors.input,
  },
  surface: {
    card: colors.card,
    dialog: colors.backgroundTertiary,
    input: colors.input,
    border: colors.border,
  },
  text: {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    disabled: colors.textDisabled,
    inverse: colors.black,
  },
  neutral: {
    0: colors.white,
    950: colors.black,
  },
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
    '6xl': 48,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const theme = {
  colors: {
    ...colors,
    ...nestedColors,
  },
  spacing,
  radius,
  typography,
} as const;

export const themeCompat = { colors, spacing, radius, typography } as const;
export const mobileTheme = themeCompat;
export const rootMobileTheme = theme;
export default theme;

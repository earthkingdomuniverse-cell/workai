export const colors = {
  primary: '#0ea5e9',
  secondary: '#a855f7',
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  backgroundTertiary: '#334155',
  card: '#1e293b',
  border: '#64748b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  white: '#ffffff',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  fontSize: {
    xxs: 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
} as const;

export const theme = {
  colors: {
    border: colors.border,
    card: colors.card,
    primary: {
      300: '#7dd3fc',
      400: '#38bdf8',
      500: colors.primary,
      900: '#0c4a6e',
      950: '#082f49',
    },
    secondary: {
      300: '#d8b4fe',
      500: colors.secondary,
      700: '#7e22ce',
      900: '#581c87',
    },
    background: {
      primary: colors.background,
      secondary: colors.backgroundSecondary,
      tertiary: colors.backgroundTertiary,
    },
    neutral: {
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
    },
    surface: {
      card: colors.card,
      input: '#475569',
      border: colors.border,
    },
    text: {
      primary: colors.text,
      secondary: colors.textSecondary,
      tertiary: colors.textTertiary,
    },
    success: {
      main: colors.success,
      light: '#86efac',
    },
    error: {
      main: colors.error,
      light: '#f87171',
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
  },
  spacing,
  radius,
  typography,
  shadows,
} as const;

export default theme;

export const colors = {
  // Primary - Premium Dark Theme
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary - Purple Accent
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764',
  },

  // Neutral - Dark Background
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Status Colors with semantic and numeric aliases
  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#15803d',
    300: '#86efac',
    500: '#22c55e',
    700: '#15803d',
  },
  error: {
    light: '#f87171',
    main: '#ef4444',
    dark: '#b91c1c',
    300: '#f87171',
    500: '#ef4444',
    700: '#b91c1c',
  },
  warning: {
    light: '#fbbf24',
    main: '#f59e0b',
    dark: '#b45309',
    300: '#fbbf24',
    500: '#f59e0b',
    700: '#b45309',
  },
  info: {
    light: '#67e8f9',
    main: '#06b6d4',
    dark: '#0e7490',
    300: '#67e8f9',
    500: '#06b6d4',
    700: '#0e7490',
  },

  // Background
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    elevated: '#475569',
  },

  // Surface
  surface: {
    card: '#1e293b',
    dialog: '#334155',
    input: '#475569',
    border: '#64748b',
  },

  // Text
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    disabled: '#64748b',
    inverse: '#0f172a',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type TextColorKey = keyof typeof colors.text;
export type StatusColorKey = 'success' | 'error' | 'warning' | 'info';

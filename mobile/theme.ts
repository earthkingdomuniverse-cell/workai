import rootTheme, { colors as nestedColors, radius, spacingPx } from '../src/theme';

export * from '../src/theme';
export { default, theme } from '../src/theme';

export const colors = {
  background: nestedColors.background.primary,
  backgroundSecondary: nestedColors.background.secondary,
  backgroundTertiary: nestedColors.background.tertiary,
  card: nestedColors.surface.card,
  surface: nestedColors.surface.card,
  border: nestedColors.surface.border,
  input: nestedColors.surface.input,
  text: nestedColors.text.primary,
  textSecondary: nestedColors.text.secondary,
  textTertiary: nestedColors.text.tertiary,
  textDisabled: nestedColors.text.disabled,
  primary: nestedColors.primary[500],
  primaryLight: nestedColors.primary[300],
  primaryDark: nestedColors.primary[700],
  secondary: nestedColors.secondary[500],
  success: nestedColors.success.main,
  warning: nestedColors.warning.main,
  error: nestedColors.error.main,
  info: nestedColors.info.main,
  white: nestedColors.neutral[0],
  black: nestedColors.neutral[950],
} as const;

export const spacing = {
  xs: spacingPx.xs,
  sm: spacingPx.sm,
  md: spacingPx.md,
  lg: spacingPx.lg,
  xl: spacingPx.xl,
  '2xl': spacingPx['2xl'],
  '3xl': spacingPx['3xl'],
  '4xl': spacingPx['4xl'],
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
} as const;

export { radius };
export const themeCompat = { colors, spacing, radius, typography } as const;
export const mobileTheme = themeCompat;
export const rootMobileTheme = rootTheme;

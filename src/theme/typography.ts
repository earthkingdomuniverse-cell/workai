import { colors } from './colors';

export const typography = {
  // Font Families
  fontFamily: {
    primary: 'Inter',
    secondary: 'SF Pro Display',
    mono: 'SF Mono',
  },

  // Font Sizes (in pixels for React Native)
  fontSize: {
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

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
} as const;

export const textStyles = {
  // Heading Styles
  h1: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.lettering.tight,
    color: colors.text.primary,
  },
  h2: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.lettering.tight,
    color: colors.text.primary,
  },
  h3: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.lettering.normal,
    color: colors.text.primary,
  },
  h4: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.normal,
    color: colors.text.primary,
  },
  h5: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.normal,
    color: colors.text.primary,
  },
  h6: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.normal,
    color: colors.text.primary,
  },

  // Body Styles
  body1: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.lettering.normal,
    color: colors.text.primary,
  },
  body2: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.lettering.normal,
    color: colors.text.secondary,
  },
  body3: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.lettering.normal,
    color: colors.text.tertiary,
  },

  // Label Styles
  label1: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.wide,
    color: colors.text.primary,
  },
  label2: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.wide,
    color: colors.text.secondary,
  },

  // Caption
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.normal,
    color: colors.text.tertiary,
  },

  // Button
  button: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.wide,
    color: colors.text.primary,
  },
  buttonSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.lettering.wide,
    color: colors.text.primary,
  },
} as const;

export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
export type TextStyleKey = keyof typeof textStyles;

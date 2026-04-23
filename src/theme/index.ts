export * from './colors';
export * from './spacing';
export * from './radius';
export * from './typography';
export * from './shadows';
export * from './status';

import { colors } from './colors';
import { spacing, spacingPx } from './spacing';
import { radius } from './radius';
import { typography, textStyles } from './typography';
import { shadows } from './shadows';
import { statusColors, getStatusColor } from './status';

export const theme = {
  colors,
  spacing,
  spacingPx,
  radius,
  typography,
  textStyles,
  shadows,
  statusColors,
  getStatusColor,
} as const;

export type Theme = typeof theme;
export default theme;

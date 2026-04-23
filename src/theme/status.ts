import { colors } from './colors';

export const statusColors = {
  // Deal Status
  created: {
    bg: colors.primary[900],
    text: colors.primary[300],
    border: colors.primary[700],
  },
  funded: {
    bg: colors.info.light + '20',
    text: colors.info.light,
    border: colors.info.main,
  },
  submitted: {
    bg: colors.secondary[900],
    text: colors.secondary[300],
    border: colors.secondary[700],
  },
  released: {
    bg: colors.success.main + '20',
    text: colors.success.main,
    border: colors.success.dark,
  },
  disputed: {
    bg: colors.error.main + '20',
    text: colors.error.light,
    border: colors.error.dark,
  },
  refunded: {
    bg: colors.warning.main + '20',
    text: colors.warning.light,
    border: colors.warning.dark,
  },
  under_review: {
    bg: colors.neutral[700],
    text: colors.neutral[300],
    border: colors.neutral[500],
  },
  in_progress: {
    bg: colors.primary[900],
    text: colors.primary[300],
    border: colors.primary[600],
  },
  pending: {
    bg: colors.neutral[800],
    text: colors.neutral[400],
    border: colors.neutral[600],
  },
  completed: {
    bg: colors.success.main + '20',
    text: colors.success.main,
    border: colors.success.dark,
  },
  cancelled: {
    bg: colors.neutral[800],
    text: colors.neutral[500],
    border: colors.neutral[600],
  },
} as const;

export const statusKeys = Object.keys(statusColors) as StatusKey[];

export type StatusKey = keyof typeof statusColors;

export function getStatusColor(status: string | undefined | null): typeof statusColors.created {
  if (!status) return statusColors.pending;
  const key = status.toLowerCase().replace(/ /g, '_') as StatusKey;
  return statusColors[key] || statusColors.pending;
}

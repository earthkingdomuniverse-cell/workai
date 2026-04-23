import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../src/theme';

interface TrustScoreCardProps {
  trustScore: number;
  verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium_verified';
  completedDeals: number;
  reviewCount: number;
  disputeRatio: number;
}

interface VerificationBadgeProps {
  level: 'unverified' | 'basic' | 'verified' | 'premium_verified';
  size?: 'small' | 'medium' | 'large';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ level, size = 'medium' }) => {
  const getVerificationInfo = (lvl: string) => {
    switch (lvl) {
      case 'unverified':
        return { label: 'Unverified', color: colors.textSecondary, icon: '⚪' };
      case 'basic':
        return { label: 'Basic', color: colors.info, icon: '✓' };
      case 'verified':
        return { label: 'Verified', color: colors.success, icon: '✓' };
      case 'premium_verified':
        return { label: 'Premium', color: colors.success, icon: '★' };
      default:
        return { label: 'Verified', color: colors.success, icon: '✓' };
    }
  };

  const { label, color, icon } = getVerificationInfo(level);
  const iconSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;
  const textSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.badgeIcon, { fontSize: iconSize }]}>{icon}</Text>
      <Text style={[styles.badgeText, { color, fontSize: textSize }]}>{label}</Text>
    </View>
  );
};

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  trustScore,
  verificationLevel,
  completedDeals,
  reviewCount,
  disputeRatio,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  };

  const scoreColor = getScoreColor(trustScore);
  const disputePercent = Math.round(disputeRatio * 100);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: scoreColor }]}>{trustScore}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(trustScore)}</Text>
        </View>
        <VerificationBadge level={verificationLevel} size="medium" />
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{completedDeals}</Text>
          <Text style={styles.statLabel}>Deals</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.stat}>
          <Text
            style={[
              styles.statValue,
              { color: disputePercent <= 5 ? colors.success : colors.warning },
            ]}
          >
            {disputePercent}%
          </Text>
          <Text style={styles.statLabel}>Disputes</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    margin: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreContainer: {
    alignItems: 'flex-start',
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    lineHeight: 52,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeIcon: {
    marginRight: spacing.xs,
  },
  badgeText: {
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '600',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default TrustScoreCard;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface VerificationBadgeProps {
  level: 'unverified' | 'basic' | 'verified' | 'premium_verified';
  size?: 'small' | 'medium' | 'large';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ level }) => {
  const getVerificationInfo = (level: string) => {
    switch (level) {
      case 'unverified':
        return { label: 'Unverified', color: colors.textSecondary };
      case 'basic':
        return { label: 'Basic Verified', color: colors.info };
      case 'verified':
        return { label: 'Verified', color: colors.success };
      case 'premium_verified':
        return { label: 'Premium Verified', color: colors.primary };
      default:
        return { label: 'Verified', color: colors.success };
    }
  };

  const { label, color } = getVerificationInfo(level);

  return (
    <View style={[styles.badge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default VerificationBadge;

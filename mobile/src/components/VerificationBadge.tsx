import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';

interface VerificationBadgeProps {
  level: 'unverified' | 'basic' | 'verified' | 'premium_verified';
  size?: 'small' | 'medium' | 'large';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({ level, size = 'medium' }) => {
  const getVerificationInfo = (level: string) => {
    switch (level) {
      case 'unverified':
        return {
          label: 'Unverified',
          color: colors.textSecondary,
          icon: '❌',
        };
      case 'basic':
        return {
          label: 'Basic Verified',
          color: colors.info,
          icon: '✅',
        };
      case 'verified':
        return {
          label: 'Verified',
          color: colors.success,
          icon: '✅',
        };
      case 'premium_verified':
        return {
          label: 'Premium Verified',
          color: colors.primary,
          icon: '✅',
        };
      default:
        return {
          label: 'Verified',
          color: colors.success,
          icon: '✅',
        };
    }
  };

  const { label, color, icon } = getVerificationInfo(level);

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

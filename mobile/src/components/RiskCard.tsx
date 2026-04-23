import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';

interface RiskCardProps {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  flags: any[];
  onUserPress?: (userId: string) => void;
}

const RiskCard: React.FC<RiskCardProps> = ({
  riskScore,
  riskLevel,
  userId,
  flags,
  onUserPress,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      case 'critical':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low':
        return 'Low Risk';
      case 'medium':
        return 'Medium Risk';
      case 'high':
        return 'High Risk';
      case 'critical':
        return 'Critical Risk';
      default:
        return level;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userId}>User ID: {userId}</Text>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(riskLevel) + '15' }]}>
          <Text style={[styles.riskText, { color: getRiskColor(riskLevel) }]}>
            {getRiskLabel(riskLevel)}
          </Text>
        </View>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Risk Score</Text>
        <Text style={styles.riskScore}>{riskScore}/100</Text>
      </View>

      <View style={styles.flagsContainer}>
        <Text style={styles.flagsTitle}>Risk Flags:</Text>
        {flags.map((flag, index) => (
          <View key={index} style={styles.flagItem}>
            <Text style={styles.flagType}>{flag.type}:</Text>
            <Text style={styles.flagDescription}>{flag.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userId: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  riskText: {
    ...typography.caption,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  riskScore: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  flagsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  flagsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  flagItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  flagType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  flagDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default RiskCard;

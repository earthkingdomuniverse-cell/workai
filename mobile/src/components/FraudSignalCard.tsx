import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';

interface FraudSignalCardProps {
  signal: {
    id: string;
    userId: string;
    type: string;
    description: string;
    confidence: number;
    evidence: string[];
    status: string;
    createdAt: string;
  };
  onUserPress?: (userId: string) => void;
}

const FraudSignalCard: React.FC<FraudSignalCardProps> = ({ signal, onUserPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected':
        return colors.warning;
      case 'under_review':
        return colors.info;
      case 'confirmed':
        return colors.error;
      case 'dismissed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      suspicious_activity: 'Suspicious Activity',
      payment_fraud: 'Payment Fraud',
      multiple_accounts: 'Multiple Accounts',
      suspicious_ip: 'Suspicious IP',
      unusual_activity: 'Unusual Activity',
    };

    return typeLabels[type] || type;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.userId} onPress={() => onUserPress && onUserPress(signal.userId)}>
          User: {signal.userId}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(signal.status) + '15' }]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(signal.status) }]}>
            {signal.status}
          </Text>
        </View>
      </View>

      <Text style={styles.type}>{getTypeLabel(signal.type)}</Text>
      <Text style={styles.description}>{signal.description}</Text>

      <View style={styles.confidenceContainer}>
        <Text style={styles.confidenceLabel}>Confidence:</Text>
        <Text style={styles.confidenceValue}>{signal.confidence}%</Text>
      </View>

      <View style={styles.evidenceContainer}>
        <Text style={styles.evidenceTitle}>Evidence:</Text>
        {signal.evidence.map((evidence, index) => (
          <Text key={index} style={styles.evidenceItem}>
            • {evidence}
          </Text>
        ))}
      </View>

      <Text style={styles.timestamp}>Detected: {new Date(signal.createdAt).toLocaleString()}</Text>
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
    borderLeftColor: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userId: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  type: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  confidenceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confidenceValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: 'bold',
  },
  evidenceContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  evidenceTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  evidenceItem: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default FraudSignalCard;

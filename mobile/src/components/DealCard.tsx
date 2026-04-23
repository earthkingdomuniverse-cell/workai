import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme';

interface Deal {
  id: string;
  title: string;
  status:
    | 'created'
    | 'funded'
    | 'submitted'
    | 'released'
    | 'disputed'
    | 'refunded'
    | 'under_review';
  amount: number;
  currency: string;
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
  };
  client?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
  };
  milestones?: {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  }[];
  createdAt: string;
  updatedAt: string;
}

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onPress }) => {
  const getStatusColor = (status: Deal['status']) => {
    switch (status) {
      case 'created':
        return colors.primary;
      case 'funded':
        return colors.info;
      case 'submitted':
        return colors.warning;
      case 'released':
        return colors.success;
      case 'disputed':
        return colors.error;
      case 'refunded':
        return colors.textSecondary;
      case 'under_review':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: Deal['status']) => {
    switch (status) {
      case 'created':
        return 'Created';
      case 'funded':
        return 'Funded';
      case 'submitted':
        return 'Submitted';
      case 'released':
        return 'Released';
      case 'disputed':
        return 'Disputed';
      case 'refunded':
        return 'Refunded';
      case 'under_review':
        return 'Under Review';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = () => {
    if (!deal.milestones || deal.milestones.length === 0) return 0;
    const completed = deal.milestones.filter((m) => m.status === 'completed').length;
    return Math.round((completed / deal.milestones.length) * 100);
  };

  return (
    <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{deal.title}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(deal.status) + '15' }]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(deal.status) }]}>
              {getStatusLabel(deal.status)}
            </Text>
          </View>
        </View>

        {deal.provider && (
          <View style={styles.providerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{deal.provider.displayName.charAt(0)}</Text>
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{deal.provider.displayName}</Text>
              {deal.provider.trustScore && (
                <Text style={styles.trustScore}>
                  Trust Score: {deal.provider.trustScore.toFixed(1)}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Amount:</Text>
        <Text style={styles.amountValue}>{formatAmount(deal.amount, deal.currency)}</Text>
      </View>

      {deal.milestones && deal.milestones.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{getProgress()}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgress()}%`, backgroundColor: getStatusColor(deal.status) },
              ]}
            />
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Created: {new Date(deal.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.dateText}>
          Updated: {new Date(deal.updatedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '600',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  trustScore: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  amountLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressValue: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default DealCard;

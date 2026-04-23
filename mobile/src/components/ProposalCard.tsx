import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows } from '../theme';

interface Proposal {
  id: string;
  title: string;
  message: string;
  proposedAmount: number;
  currency: string;
  estimatedDeliveryDays: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  provider?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    trustScore?: number;
  };
  request?: {
    id: string;
    title: string;
  };
  offer?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  showActions?: boolean;
  isClient?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onPress,
  onAccept,
  onReject,
  showActions = false,
  isClient = false,
}) => {
  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'withdrawn':
        return colors.textSecondary;
      case 'expired':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getStatusLabel = (status: Proposal['status']) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity style={[styles.card, shadows.sm]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{proposal.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(proposal.status) + '15' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(proposal.status) }]}>
              {getStatusLabel(proposal.status)}
            </Text>
          </View>
        </View>

        {proposal.provider && (
          <View style={styles.providerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{proposal.provider.displayName.charAt(0)}</Text>
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{proposal.provider.displayName}</Text>
              {typeof proposal.provider.trustScore === 'number' && (
                <Text style={styles.trustScore}>
                  Trust Score: {proposal.provider.trustScore.toFixed(1)}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      <Text style={styles.message} numberOfLines={3}>
        {proposal.message}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>
            {formatAmount(proposal.proposedAmount, proposal.currency)}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Delivery</Text>
          <Text style={styles.detailValue}>{proposal.estimatedDeliveryDays} days</Text>
        </View>

        {(proposal.request || proposal.offer) && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>For</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {proposal.request?.title || proposal.offer?.title}
            </Text>
          </View>
        )}
      </View>

      {showActions && isClient && proposal.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={onReject}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {showActions && !isClient && proposal.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, styles.waitButton]}>
            <Text style={styles.waitButtonText}>Awaiting Response</Text>
          </TouchableOpacity>
        </View>
      )}
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
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  acceptButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  rejectButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  waitButton: {
    backgroundColor: colors.border,
  },
  waitButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default ProposalCard;

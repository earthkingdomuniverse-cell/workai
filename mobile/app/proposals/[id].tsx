import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../theme';
import { proposalService, Proposal as ProposalType } from '../../src/services/proposalService';
import { useAuth } from '../../src/hooks/useAuth';
import ProposalCard from '../../src/components/ProposalCard';

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [proposal, setProposal] = useState<ProposalType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProposal();
  }, [id]);

  const loadProposal = async () => {
    if (!id) return;
    setLoading(true);
    try {
      setError(null);
      const data = await proposalService.getProposal(id);
      setProposal(data);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Failed to load proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!proposal) return;

    Alert.alert(
      'Accept Proposal',
      'Are you sure you want to accept this proposal? This will create a deal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              const updated = await proposalService.acceptProposal(proposal.id);
              setProposal(updated);
              Alert.alert('Success', 'Proposal accepted successfully.');
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.error?.message || 'Failed to accept proposal',
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleReject = async () => {
    if (!proposal) return;

    Alert.alert('Reject Proposal', 'Are you sure you want to reject this proposal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const updated = await proposalService.rejectProposal(proposal.id);
            setProposal(updated);
          } catch (error: any) {
            Alert.alert(
              'Error',
              error.response?.data?.error?.message || 'Failed to reject proposal',
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleWithdraw = async () => {
    if (!proposal) return;

    Alert.alert('Withdraw Proposal', 'Are you sure you want to withdraw this proposal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            const updated = await proposalService.withdrawProposal(proposal.id);
            setProposal(updated);
          } catch (error: any) {
            Alert.alert(
              'Error',
              error.response?.data?.error?.message || 'Failed to withdraw proposal',
            );
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!proposal) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Proposal not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isClient = user?.id === proposal.clientId;
  const isProvider = user?.id === proposal.providerId;
  const canAct = isClient && proposal.status === 'pending';
  const canWithdraw = isProvider && proposal.status === 'pending';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ProposalCard proposal={proposal} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proposal Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {formatAmount(proposal.proposedAmount, proposal.currency)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Delivery Time</Text>
              <Text style={styles.detailValue}>{proposal.estimatedDeliveryDays} days</Text>
            </View>
            {proposal.revisions && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Revisions</Text>
                <Text style={styles.detailValue}>{proposal.revisions}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message</Text>
          <Text style={styles.message}>{proposal.message}</Text>
        </View>

        {(proposal.request || proposal.offer) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Related To</Text>
            <View style={styles.relatedInfo}>
              <Text style={styles.relatedLabel}>{proposal.request ? 'Request' : 'Offer'}</Text>
              <Text style={styles.relatedTitle}>
                {proposal.request?.title || proposal.offer?.title}
              </Text>
            </View>
          </View>
        )}

        {(canAct || canWithdraw) && (
          <View style={styles.actions}>
            {canAct && (
              <>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.acceptButton,
                    actionLoading && styles.actionButtonDisabled,
                  ]}
                  onPress={handleAccept}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.acceptButtonText}>Accept Proposal</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.rejectButton,
                    actionLoading && styles.actionButtonDisabled,
                  ]}
                  onPress={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
            {canWithdraw && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.withdrawButton,
                  actionLoading && styles.actionButtonDisabled,
                ]}
                onPress={handleWithdraw}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.withdrawButtonText}>Withdraw Proposal</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.timestamps}>
          <Text style={styles.timestampText}>
            Created: {new Date(proposal.createdAt).toLocaleString()}
          </Text>
          {proposal.updatedAt !== proposal.createdAt && (
            <Text style={styles.timestampText}>
              Updated: {new Date(proposal.updatedAt).toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
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
  message: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  relatedInfo: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  relatedLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  relatedTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
  withdrawButton: {
    backgroundColor: colors.textSecondary,
  },
  withdrawButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  timestamps: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timestampText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  errorText: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  backButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

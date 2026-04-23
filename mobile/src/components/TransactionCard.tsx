import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme';

interface Transaction {
  id: string;
  dealId: string;
  amount: number;
  currency: string;
  type: 'fund' | 'release' | 'refund' | 'payout' | 'service_fee' | 'dispute_resolution';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  referenceNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onPress }) => {
  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'fund':
        return 'Funding';
      case 'release':
        return 'Funds Released';
      case 'refund':
        return 'Refund';
      case 'payout':
        return 'Payout';
      case 'service_fee':
        return 'Service Fee';
      case 'dispute_resolution':
        return 'Dispute Resolution';
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'fund':
        return colors.primary;
      case 'release':
        return colors.success;
      case 'refund':
        return colors.error;
      case 'payout':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getTransactionStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTransactionTypeLabel(transaction.type)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getTransactionTypeColor(transaction.type)}22` }]}>
          <Text style={[styles.statusText, { color: getTransactionTypeColor(transaction.type) }]}>
            {getTransactionStatusLabel(transaction.status)}
          </Text>
        </View>
      </View>
      <View style={styles.amountRow}>
        <Text style={styles.amount}>{formatAmount(transaction.amount, transaction.currency)}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(transaction.createdAt).toLocaleString()}</Text>
        <Text style={styles.reference}>Ref: {transaction.referenceNumber}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  statusText: { ...typography.caption, fontWeight: '600' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  amount: { ...typography.h1, color: colors.text, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  date: { ...typography.caption, color: colors.textSecondary },
  reference: { ...typography.caption, color: colors.textSecondary },
});

export default TransactionCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface Receipt {
  id: string;
  dealId: string;
  transactionId: string;
  amount: number;
  currency: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  serviceFee: number;
  total: number;
  paidAt: string;
  receiptNumber: string;
  status: 'paid' | 'refunded' | 'void';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReceiptCardProps {
  receipt: Receipt;
  onPress?: () => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'refunded':
        return colors.error;
      case 'void':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'refunded':
        return 'Refunded';
      case 'void':
        return 'Void';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.header}>
        <Text style={styles.receiptNumber}>Receipt #{receipt.receiptNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(receipt.status) + '15' }]}> 
          <Text style={[styles.statusText, { color: getStatusColor(receipt.status) }]}>
            {getStatusLabel(receipt.status)}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Total</Text>
        <Text style={styles.amountValue}>{formatAmount(receipt.total, receipt.currency)}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{new Date(receipt.paidAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={styles.detailValue}>{receipt.items.length}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.dealId}>Deal: {receipt.dealId}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  receiptNumber: {
    ...typography.h3,
    color: colors.text,
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  amountLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  amountValue: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dealId: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ReceiptCard;

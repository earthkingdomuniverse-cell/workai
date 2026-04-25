import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ProofCardProps {
  type: 'id' | 'address' | 'education' | 'employment' | 'financial' | 'other';
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  documentUrl?: string;
  verifiedAt?: string;
  expiresAt?: string;
}

const ProofCard: React.FC<ProofCardProps> = ({
  type,
  status,
  verifiedAt,
  expiresAt,
}) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'id':
        return 'ID Document';
      case 'address':
        return 'Address Proof';
      case 'education':
        return 'Education Certificate';
      case 'employment':
        return 'Employment Verification';
      case 'financial':
        return 'Financial Statement';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Verification';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'verified':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'expired':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.type}>{getTypeLabel(type)}</Text>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
          {getStatusLabel(status)}
        </Text>
      </View>
      {verifiedAt && (
        <Text style={styles.verifiedAt}>Verified: {new Date(verifiedAt).toLocaleDateString()}</Text>
      )}
      {expiresAt && (
        <Text style={styles.expiresAt}>Expires: {new Date(expiresAt).toLocaleDateString()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  type: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  verifiedAt: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  expiresAt: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default ProofCard;

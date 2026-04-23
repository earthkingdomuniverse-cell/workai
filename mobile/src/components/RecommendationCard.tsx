import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';

interface Recommendation {
  id: string;
  type: 'offer' | 'request' | 'user' | 'deal' | 'proposal';
  entityId: string;
  title: string;
  description: string;
  reason: string;
  reasonText: string;
  score: number;
  relevance: number;
  thumbnail?: string;
  metadata: {
    price?: number;
    currency?: string;
    deliveryTime?: number;
    provider?: {
      id: string;
      displayName: string;
      trustScore?: number;
    };
    requester?: {
      id: string;
      displayName: string;
      trustScore?: number;
    };
    skills?: string[];
  };
  createdAt: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onPress }) => {
  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(recommendation)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{recommendation.title}</Text>
        <Text style={styles.description}>{recommendation.description}</Text>

        {recommendation.metadata.price && (
          <Text style={styles.price}>
            {formatAmount(recommendation.metadata.price, recommendation.metadata.currency || 'USD')}
          </Text>
        )}

        {recommendation.metadata.provider && (
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{recommendation.metadata.provider.displayName}</Text>
            {recommendation.metadata.provider.trustScore && (
              <Text style={styles.trustScore}>
                Trust: {recommendation.metadata.provider.trustScore}
              </Text>
            )}
          </View>
        )}

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonText}>{recommendation.reasonText}</Text>
        </View>

        <Text style={styles.date}>{formatDate(recommendation.createdAt)}</Text>
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  price: {
    ...typography.h2,
    color: colors.success,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  providerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  providerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  trustScore: {
    ...typography.caption,
    color: colors.primary,
  },
  reasonContainer: {
    backgroundColor: colors.primary + '10',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  reasonText: {
    ...typography.caption,
    color: colors.primary,
    fontStyle: 'italic',
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default RecommendationCard;

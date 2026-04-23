import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../../src/theme';
import RatingStars from './RatingStars';

interface Review {
  id: string;
  dealId: string;
  reviewerId: string;
  reviewerRole: 'client' | 'provider';
  subjectType: 'user' | 'offer';
  subjectId: string;
  rating: number;
  comment: string;
  tags: string[];
  helpfulCount: number;
  reported: boolean;
  reviewer?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReviewCardProps {
  review: Review;
  onPress?: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {review.reviewer && (
          <View style={styles.reviewerInfo}>
            {review.reviewer.avatarUrl ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{review.reviewer.displayName.charAt(0)}</Text>
              </View>
            ) : null}
            <View style={styles.reviewerDetails}>
              <Text style={styles.reviewerName}>{review.reviewer.displayName}</Text>
              <Text style={styles.reviewerRole}>
                {review.reviewerRole === 'client' ? 'Client' : 'Provider'}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.ratingContainer}>
          <RatingStars rating={review.rating} size="medium" />
        </View>
      </View>

      <Text style={styles.comment}>{review.comment}</Text>

      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.helpful}>{review.helpfulCount} helpful</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  reviewerInfo: {
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
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  reviewerRole: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  comment: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  helpful: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default ReviewCard;

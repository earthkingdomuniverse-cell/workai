import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { SkillTagList } from '../../src/components/SkillTagList';
import { offerService } from '../../src/services/offerService';
import { trustService, TrustProfile } from '../../src/services/trustService';
import { reviewService, Review, ReviewAggregate } from '../../src/services/reviewService';
import RatingStars from '../../src/components/RatingStars';
import ReviewCard from '../../src/components/ReviewCard';

export default function OfferDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<any>(null);
  const [providerTrust, setProviderTrust] = useState<TrustProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewAggregate, setReviewAggregate] = useState<ReviewAggregate | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffer = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await offerService.getOffer(id as string);

        // Try to fetch provider trust profile
        let trust: TrustProfile | null = null;
        try {
          if (data.providerId) {
            trust = await trustService.getTrustProfile(data.providerId);
          }
        } catch (e) {
          // Trust not found, will use fallback
        }
        setProviderTrust(trust);
        setOffer({
          ...data,
          provider: {
            ...data.provider,
            trustScore: trust?.trustScore ?? data.provider?.trustScore ?? null,
            verificationLevel: trust?.verificationLevel ?? data.provider?.verificationLevel ?? null,
            completedDeals: trust?.completedDeals ?? data.provider?.completedDeals ?? null,
          },
        });

        try {
          setReviewsLoading(true);
          setReviewsError(null);
          const [reviewItems, aggregate] = await Promise.all([
            reviewService.getReviewsByOfferId(data.id),
            reviewService.getReviewAggregate('offer', data.id),
          ]);
          setReviews(reviewItems);
          setReviewAggregate(aggregate);
        } catch (_reviewError) {
          setReviewsError('Failed to load offer reviews');
        } finally {
          setReviewsLoading(false);
        }
      } catch (_err) {
        setError('Failed to load offer details');
      } finally {
        setLoading(false);
      }
    };
    loadOffer();
  }, [id]);

  if (loading) return <LoadingState fullScreen message="Loading offer..." />;
  if (error || !offer) return <ErrorState message={error || 'Offer not found'} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{offer.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{offer.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Price</Text>
        <Text style={styles.price}>${offer.price}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Delivery Time</Text>
        <Text style={styles.deliveryTime}>{offer.deliveryTime || 0} days</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Skills</Text>
        {offer.skills && offer.skills.length > 0 ? (
          <SkillTagList skills={offer.skills.map((s: string) => ({ id: s, name: s }))} />
        ) : (
          <Text style={styles.emptyText}>No skills listed</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Provider</Text>
        <View style={styles.providerRow}>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>{offer.provider.displayName || 'Unknown'}</Text>
            <View style={styles.providerStats}>
              <Text style={styles.trustScore}>
                Trust Score: {offer.provider.trustScore != null ? offer.provider.trustScore : 'N/A'}
              </Text>
              <Text style={styles.completedDeals}>
                {offer.provider.completedDeals != null
                  ? `${offer.provider.completedDeals} deals`
                  : 'N/A deals'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Reviews</Text>
        {reviewsLoading ? (
          <Text style={styles.metaText}>Loading reviews...</Text>
        ) : reviewsError ? (
          <Text style={styles.errorText}>{reviewsError}</Text>
        ) : reviewAggregate ? (
          <View>
            <View style={styles.reviewSummary}>
              <RatingStars rating={reviewAggregate.averageRating || 0} />
              <Text style={styles.metaText}>{reviewAggregate.totalReviews} review(s)</Text>
            </View>
            {reviews.length === 0 ? (
              <Text style={styles.emptyText}>No reviews yet</Text>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>No reviews yet</Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push(`/deals/create?offerId=${id}` as any)}
        >
          <Text style={styles.primaryButtonText}>Create Deal</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  header: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl * 2 },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  section: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface.border,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    lineHeight: 24,
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success.main,
  },
  deliveryTime: { fontSize: theme.typography.fontSize.md, color: theme.colors.text.primary },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  providerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm },
  providerInfo: { flex: 1 },
  providerName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  providerStats: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xs },
  trustScore: { fontSize: theme.typography.fontSize.sm, color: theme.colors.primary[400] },
  completedDeals: { fontSize: theme.typography.fontSize.sm, color: theme.colors.text.tertiary },
  reviewSummary: { gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  metaText: { fontSize: theme.typography.fontSize.sm, color: theme.colors.text.tertiary },
  errorText: { fontSize: theme.typography.fontSize.sm, color: theme.colors.error.main },
  actionsContainer: { padding: theme.spacing.lg, gap: theme.spacing.md },
  primaryButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[950],
  },
  footer: { height: theme.spacing.xl * 2 },
});

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { dealService, Deal } from '../../src/services/dealService';
import { useAuth } from '../../src/hooks/useAuth';
import { reviewService } from '../../src/services/reviewService';
import RatingStars from '../../src/components/RatingStars';

export default function DealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTags, setReviewTags] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const loadDeal = async () => {
    if (!id) return;

    try {
      setError(null);
      const data = await dealService.getDeal(id);
      setDeal(data);
    } catch (_error) {
      setError('Failed to load deal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDeal();
  }, [id]);

  const handleSubmit = async () => {
    if (!deal) return;
    const firstPending = deal.milestones.find((item) => item.status !== 'completed');
    if (!firstPending) {
      Alert.alert('Error', 'No pending milestone available for submission');
      return;
    }
    setActionLoading(true);
    try {
      const updated = await dealService.submitWork(deal.id, { milestoneId: firstPending.id, notes: 'Submitted from deal detail' });
      setDeal(updated);
    } catch (_error) {
      Alert.alert('Error', 'Failed to submit work');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!deal) return;
    setActionLoading(true);
    try {
      const updated = await dealService.releaseFunds(deal.id, { amount: deal.amount, notes: 'Released from deal detail' });
      setDeal(updated);
    } catch (_error) {
      Alert.alert('Error', 'Failed to release funds');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!deal || !user) return;
    if (reviewComment.trim().length < 10) {
      setReviewError('Review comment must be at least 10 characters');
      return;
    }

    setActionLoading(true);
    setReviewError(null);
    try {
      const reviewerRole = user.id === deal.clientId ? 'client' : 'provider';
      const subjectId = reviewerRole === 'client' ? deal.providerId : deal.clientId;
      await reviewService.createReview({
        dealId: deal.id,
        reviewerRole,
        subjectType: 'user',
        subjectId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        tags: reviewTags.split(',').map((item) => item.trim()).filter(Boolean),
      });
      setReviewSubmitted(true);
      Alert.alert('Success', 'Review submitted successfully');
    } catch (_error) {
      setReviewError('Failed to submit review');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!deal) {
    return <ErrorState message={error || 'Deal not found'} onRetry={loadDeal} />;
  }

  const timeline = deal.timeline || [];
  const badgeColor =
    deal.status === 'released'
      ? colors.success
      : deal.status === 'submitted'
        ? colors.warning
        : deal.status === 'funded'
          ? colors.info
          : deal.status === 'disputed'
            ? colors.error
            : colors.primary;

  const isClient = user?.id === deal.clientId;
  const isProvider = user?.id === deal.providerId;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{deal.title}</Text>
          <View style={[styles.badge, { backgroundColor: `${badgeColor}22` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{deal.status}</Text>
          </View>
        </View>
        <Text style={styles.description}>{deal.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deal Information</Text>
        <View style={styles.infoRow}><Text style={styles.label}>Amount</Text><Text style={styles.value}>{deal.currency} {deal.amount}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>Funded</Text><Text style={styles.value}>{deal.currency} {deal.fundedAmount}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>Released</Text><Text style={styles.value}>{deal.currency} {deal.releasedAmount}</Text></View>
        <View style={styles.infoRow}><Text style={styles.label}>Service fee</Text><Text style={styles.value}>{deal.currency} {deal.serviceFee}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>People</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Client</Text>
          <Text style={styles.value}>{deal.client?.displayName || deal.clientId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Provider</Text>
          <Text style={styles.value}>{deal.provider?.displayName || deal.providerId}</Text>
        </View>
      </View>

      {deal.offer ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Source Offer</Text>
          <Text style={styles.description}>{deal.offer.title}</Text>
          <Text style={styles.metaText}>{deal.offer.description}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <TouchableOpacity onPress={() => router.push(`/deals/timeline?dealId=${deal.id}` as any)}>
            <Text style={styles.link}>View Full Timeline</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timelinePreview}>{timeline.length} events recorded</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        {deal.status === 'created' && isClient ? (
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push(`/deals/payment?dealId=${deal.id}&amount=${deal.amount}` as any)}>
            <Text style={styles.primaryButtonText}>Fund Deal</Text>
          </TouchableOpacity>
        ) : null}
        {deal.status === 'funded' && isProvider ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Submit Work</Text>}
          </TouchableOpacity>
        ) : null}
        {deal.status === 'submitted' && isClient ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleRelease} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Release Funds</Text>}
          </TouchableOpacity>
        ) : null}
        {['funded', 'submitted', 'released'].includes(deal.status) && (isClient || isProvider) ? (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push(`/deals/dispute?id=${deal.id}` as any)}>
            <Text style={styles.secondaryButtonText}>Open Dispute</Text>
          </TouchableOpacity>
        ) : null}
        {deal.status === 'created' && !isClient ? (
          <Text style={styles.metaText}>Waiting for the client to fund this deal.</Text>
        ) : null}
      </View>

      {deal.status === 'released' && !reviewSubmitted ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          <RatingStars rating={reviewRating} editable onChange={setReviewRating} />
          <TextInput
            style={[styles.reviewInput, styles.reviewTextArea]}
            placeholder="Write your review..."
            placeholderTextColor={colors.textSecondary}
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
          />
          <TextInput
            style={styles.reviewInput}
            placeholder="Tags (comma separated)"
            placeholderTextColor={colors.textSecondary}
            value={reviewTags}
            onChangeText={setReviewTags}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleReviewSubmit} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.primaryButtonText}>Submit Review</Text>}
          </TouchableOpacity>
          {reviewError ? <Text style={styles.reviewError}>{reviewError}</Text> : null}
        </View>
      ) : null}

      {reviewSubmitted ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Submitted</Text>
          <Text style={styles.description}>Your review has been recorded for this completed deal.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  headerCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  title: { ...typography.h1, color: colors.text, flex: 1, marginRight: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  badgeText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  description: { ...typography.body, color: colors.textSecondary },
  metaText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  section: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  label: { ...typography.body, color: colors.textSecondary },
  value: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  timelinePreview: { ...typography.body, color: colors.textSecondary },
  link: { ...typography.body, color: colors.primary, fontWeight: '600' },
  primaryButton: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  primaryButtonText: { ...typography.body, color: colors.white, fontWeight: '600' },
  secondaryButton: { backgroundColor: `${colors.error}22`, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  secondaryButtonText: { ...typography.body, color: colors.error, fontWeight: '600' },
  reviewInput: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md, color: colors.text, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md, marginBottom: spacing.sm },
  reviewTextArea: { minHeight: 120, textAlignVertical: 'top' },
  reviewError: { ...typography.body, color: colors.error, marginTop: spacing.sm },
});

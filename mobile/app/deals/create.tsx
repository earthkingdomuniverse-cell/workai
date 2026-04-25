import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import { ErrorState } from '../../components/ErrorState';
import { LoadingState } from '../../components/LoadingState';
import { offerService, Offer } from '../../src/services/offerService';
import { dealService } from '../../src/services/dealService';

export default function DealCreateScreen() {
  const router = useRouter();
  const { offerId, requestId } = useLocalSearchParams<{ offerId?: string; requestId?: string }>();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(Boolean(offerId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOffer = async () => {
    if (!offerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await offerService.getOffer(offerId);
      setOffer(data);
    } catch (_error) {
      setError('Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffer();
  }, [offerId]);

  const handleCreateFromOffer = async () => {
    if (!offerId) {
      setError('Missing offer id');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const deal = await dealService.createDeal({ offerId });
      Alert.alert('Deal created', 'The deal has been created successfully.', [
        {
          text: 'View Deal',
          onPress: () => router.replace(`/deals/${deal.id}` as any),
        },
      ]);
    } catch (_error) {
      setError('Failed to create deal from this offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading deal setup..." />;
  }

  if (error && !offer && offerId) {
    return <ErrorState message={error} onRetry={loadOffer} />;
  }

  if (!offerId && requestId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.title}>Create Deal</Text>
        <Text style={styles.subtitle}>Request-based deal creation will be handled in the request flow.</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/deals')}>
          <Text style={styles.secondaryButtonText}>Go to Deals</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!offerId) {
    return <ErrorState message="Missing offer or request id" onRetry={() => router.replace('/(tabs)/deals')} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Deal</Text>
      <Text style={styles.subtitle}>Review the offer details before creating a deal.</Text>

      {offer ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Offer</Text>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          <Text style={styles.description}>{offer.description}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>{offer.currency || 'USD'} {offer.price}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pricing</Text>
            <Text style={styles.infoValue}>{offer.pricingType}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Provider</Text>
            <Text style={styles.infoValue}>{offer.provider?.displayName || offer.providerId || 'Unknown'}</Text>
          </View>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, submitting && styles.buttonDisabled]}
        onPress={handleCreateFromOffer}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Create Deal</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} disabled={submitting}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  offerTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoLabel: { ...typography.body, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: { ...typography.body, color: colors.white, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: { ...typography.body, color: colors.text, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  errorText: { ...typography.body, color: colors.error, marginBottom: spacing.md },
});

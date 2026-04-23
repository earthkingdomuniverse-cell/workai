import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import TrustScoreCard from '../../src/components/TrustScoreCard';
import VerificationBadge from '../../src/components/VerificationBadge';
import { trustService, TrustProfile } from '../../src/services/trustService';
import { useAuth } from '../../src/hooks/useAuth';
import { reviewService, ReviewAggregate } from '../../src/services/reviewService';
import RatingStars from '../../src/components/RatingStars';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [trustProfile, setTrustProfile] = useState<TrustProfile | null>(null);
  const [reviewAggregate, setReviewAggregate] = useState<ReviewAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrustProfile = async () => {
      try {
        setLoading(true);
        const [trustData, reviewData] = await Promise.all([
          trustService.getMyTrustProfile(),
          reviewService.getReviewAggregate('user', user.id),
        ]);
        setTrustProfile(trustData);
        setReviewAggregate(reviewData);
      } catch (err) {
        setError('Failed to load trust profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTrustProfile();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  if (error || !trustProfile) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || 'Unable to load profile'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <TrustScoreCard
        trustScore={trustProfile.trustScore}
        verificationLevel={trustProfile.verificationLevel}
        completedDeals={trustProfile.completedDeals}
        reviewCount={trustProfile.reviewCount}
        disputeRatio={trustProfile.disputeRatio}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating Overview</Text>
        <RatingStars rating={reviewAggregate?.averageRating || 0} />
        <Text style={styles.bio}>{reviewAggregate?.totalReviews || 0} total review(s)</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    ...typography.body,
    color: colors.text,
  },
  error: {
    ...typography.body,
    color: colors.error,
  },
  header: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: 4,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  displayName: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

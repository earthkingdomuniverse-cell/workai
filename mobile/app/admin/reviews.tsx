import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { reviewService, Review } from '../../src/services/reviewService';

export default function AdminReviewsScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setError(null);
      const data = await reviewService.getReviews({});
      // Review records do not expose moderation status yet, so use reported reviews as queue.
      const flaggedReviews = data.filter((r) => r.reported === true);
      setItems(flaggedReviews);
    } catch (_error) {
      setError('Failed to load review moderation queue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (!isOperator)
    return (
      <AccessDeniedState message="Only operator and admin roles can access review moderation." />
    );
  if (loading) return <LoadingState fullScreen message="Loading reviews..." />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadReviews} />;
  if (items.length === 0)
    return (
      <EmptyState
        title="No pending reviews"
        description="Operator review queue is currently empty."
        icon="⭐"
      />
    );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadReviews();
          }}
        />
      }
    >
      <Text style={styles.title}>Reviews Management</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.cardTitle}>Review {item.id}</Text>
          <Text style={styles.cardText}>Deal: {item.dealId}</Text>
          <Text style={styles.cardText}>Rating: {item.rating}/5</Text>
          <Text style={styles.cardText}>Moderation: {item.reported ? 'reported' : 'normal'}</Text>
          <Text style={styles.cardText}>{item.comment}</Text>
          {item.reviewer && <Text style={styles.cardText}>By: {item.reviewer.displayName}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background.primary },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl * 2 },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  cardText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});

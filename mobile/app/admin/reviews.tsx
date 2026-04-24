import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { adminService } from '../../src/services/adminService';

function getModerationReviewId(item: any) {
  return item.reviewId || item.id;
}

export default function AdminReviewsScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setError(null);
      const response = await adminService.getPendingReviews();
      setItems(response.items || []);
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

  const processReview = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingId(reviewId);
      await adminService.processReviewAction(reviewId, action, `Operator ${action} action from mobile admin.`);
      await loadReviews();
    } catch (_error) {
      Alert.alert('Action failed', `Could not ${action} this review.`);
    } finally {
      setProcessingId(null);
    }
  };

  const flagReview = async (reviewId: string) => {
    try {
      setProcessingId(reviewId);
      await adminService.flagReview(reviewId, ['operator_flagged']);
      await loadReviews();
    } catch (_error) {
      Alert.alert('Flag failed', 'Could not flag this review.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access review moderation." />;
  }
  if (loading) return <LoadingState fullScreen message="Loading reviews..." />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadReviews} />;

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
      <Text style={styles.subtitle}>Moderate pending or flagged reviews from backend admin API.</Text>

      {items.length === 0 ? (
        <EmptyState title="No pending reviews" description="Operator review queue is currently empty." icon="⭐" />
      ) : (
        items.map((item) => {
          const reviewId = getModerationReviewId(item);
          return (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>Review {reviewId}</Text>
              <Text style={styles.cardText}>Deal: {item.dealId || 'unknown'}</Text>
              <Text style={styles.cardText}>Reviewer: {item.reviewerId || item.reviewer?.id || 'unknown'}</Text>
              <Text style={styles.cardText}>Subject: {item.subjectId || item.subject?.id || 'unknown'}</Text>
              <Text style={styles.cardText}>Rating: {item.rating}/5</Text>
              <Text style={styles.cardText}>Status: {item.status || 'pending'}</Text>
              <Text style={styles.comment}>{item.comment || item.content || 'No comment provided.'}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.approveButton]}
                  disabled={processingId === reviewId}
                  onPress={() => processReview(reviewId, 'approve')}
                >
                  <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rejectButton]}
                  disabled={processingId === reviewId}
                  onPress={() => processReview(reviewId, 'reject')}
                >
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.flagButton]}
                  disabled={processingId === reviewId}
                  onPress={() => flagReview(reviewId)}
                >
                  <Text style={styles.buttonText}>Flag</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
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
  comment: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  approveButton: { backgroundColor: theme.colors.success[500] },
  rejectButton: { backgroundColor: theme.colors.error[500] },
  flagButton: { backgroundColor: theme.colors.warning[500] },
  buttonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

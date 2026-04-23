import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { dealService } from '../../src/services/dealService';

export default function AdminDisputesScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDisputes = async () => {
    try {
      setError(null);
      // Fetch from deals service and filter for disputes
      const deals = await dealService.getDeals();

      // Mock dispute data combined with deals (in real app, would have dispute endpoint)
      const mockDisputes = [
        {
          id: 'dispute_1',
          dealId: 'deal_123',
          reason: 'Quality dispute',
          description: 'Work quality concern',
          status: 'open',
          createdAt: '2026-04-20T10:00:00Z',
        },
        {
          id: 'dispute_2',
          dealId: 'deal_456',
          reason: 'Payment dispute',
          description: 'Payment terms disagreement',
          status: 'investigating',
          createdAt: '2026-04-18T10:00:00Z',
        },
        {
          id: 'dispute_3',
          dealId: 'deal_789',
          reason: 'Timeline dispute',
          description: 'Delivery delay issue',
          status: 'resolved',
          createdAt: '2026-04-15T10:00:00Z',
        },
      ];

      setItems(mockDisputes);
    } catch (_error) {
      setError('Failed to load disputes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, []);

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access disputes." />;
  }
  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading disputes...</Text>
      </View>
    );
  }
  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={loadDisputes} />;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        title="No disputes"
        description="There are currently no disputes to review."
        icon="⚖️"
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadDisputes();
          }}
        />
      }
    >
      <Text style={styles.title}>Active Disputes</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.id}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.reason}>{item.reason}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loading: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.text },
  status: { ...typography.caption, color: colors.warning, fontWeight: '600' },
  reason: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: spacing.xs },
  description: { ...typography.body, color: colors.textSecondary },
});

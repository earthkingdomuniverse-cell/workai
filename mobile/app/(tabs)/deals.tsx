import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import DealCard from '../../src/components/DealCard';
import { dealService, Deal } from '../../src/services/dealService';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';

type StatusFilter =
  | 'all'
  | 'created'
  | 'funded'
  | 'submitted'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'under_review';

export default function DealsScreen() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadDeals = async () => {
    try {
      setError(null);
      const data = await dealService.getDeals();
      setDeals(data);
    } catch (_error) {
      setError('Failed to load deals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const filteredDeals = deals.filter(
    (item) => statusFilter === 'all' || item.status === statusFilter,
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && deals.length === 0) {
    return <ErrorState message={error} onRetry={loadDeals} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Deals</Text>
        <Text style={styles.count}>{deals.length} deals</Text>
      </View>

      <View style={styles.filterContainer}>
        {(
          [
            'all',
            'created',
            'funded',
            'submitted',
            'released',
            'disputed',
            'refunded',
            'under_review',
          ] as const
        ).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
              {status === 'all' ? 'All' : status.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDeals}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDeals();
            }}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <DealCard deal={item} onPress={() => router.push(`/deals/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title={statusFilter === 'all' ? 'No deals yet' : 'No deals for this status'}
            description={
              statusFilter === 'all'
                ? 'Your active and completed deals will show here.'
                : 'Try a different filter.'
            }
            icon="💼"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.text },
  count: { ...typography.body, color: colors.textSecondary },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { ...typography.caption, color: colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: colors.white },
  listContent: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xl * 2 },
});

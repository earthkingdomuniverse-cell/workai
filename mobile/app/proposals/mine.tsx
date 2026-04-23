import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../theme';
import { proposalService, Proposal } from '../../src/services/proposalService';
import ProposalCard from '../../src/components/ProposalCard';

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';

export default function MyProposalsScreen() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const loadProposals = async () => {
    try {
      setError(null);
      const data = await proposalService.getMyProposals();
      setProposals(data);
    } catch (_error) {
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProposals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadProposals();
  };

  const filteredProposals = proposals.filter((p) =>
    statusFilter === 'all' ? true : p.status === statusFilter,
  );

  const handleProposalPress = (id: string) => {
    router.push(`/proposals/${id}`);
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {(['all', 'pending', 'accepted', 'rejected', 'expired', 'withdrawn'] as const).map((status) => (
        <TouchableOpacity
          key={status}
          style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
          onPress={() => setStatusFilter(status)}
        >
          <Text style={[styles.filterText, statusFilter === status && styles.filterTextActive]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProposal = ({ item }: { item: Proposal }) => (
    <ProposalCard
      proposal={item}
      onPress={() => handleProposalPress(item.id)}
      showActions={false}
    />
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>No Proposals Yet</Text>
      <Text style={styles.emptyText}>
        {statusFilter === 'all'
          ? "You haven't submitted any proposals yet."
          : `No ${statusFilter} proposals found.`}
      </Text>
      {statusFilter !== 'all' && (
        <TouchableOpacity style={styles.clearFilterButton} onPress={() => setStatusFilter('all')}>
          <Text style={styles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && proposals.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Unable to Load</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <TouchableOpacity style={styles.clearFilterButton} onPress={loadProposals}>
          <Text style={styles.clearFilterText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Proposals</Text>
        <Text style={styles.count}>{proposals.length} total</Text>
      </View>

      {renderStatusFilter()}

      <FlatList
        data={filteredProposals}
        renderItem={renderProposal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={renderEmpty}
      />
    </View>
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
  title: {
    ...typography.h1,
    color: colors.text,
  },
  count: {
    ...typography.body,
    color: colors.textSecondary,
  },
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
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
  },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  clearFilterButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  clearFilterText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

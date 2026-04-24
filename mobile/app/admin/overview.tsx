import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { dealService } from '../../src/services/dealService';
import { offerService } from '../../src/services/offerService';
import { requestService } from '../../src/services/requestService';

interface AdminOverviewStats {
  totalUsers: number;
  totalDeals: number;
  activeDeals: number;
  activeOffers: number;
  openRequests: number;
  pendingDisputes: number;
  pendingReviews: number;
}

export default function AdminOverviewScreen() {
  const { isOperator } = useAuth();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setError(null);

      const [deals, offers, requests] = await Promise.all([
        dealService.getDeals(),
        offerService.getOffers({}),
        requestService.getRequests({}),
      ]);

      const totalDeals = deals.length;
      const activeDeals = deals.filter((deal: any) =>
        ['created', 'funded', 'submitted', 'disputed', 'under_review'].includes(deal.status),
      ).length;
      const activeOffers = offers.filter((offer: any) => offer.status !== 'archived').length;
      const openRequests = requests.filter((request: any) => request.status === 'open').length;
      const pendingDisputes = deals.filter((deal: any) => deal.status === 'disputed').length;

      setStats({
        totalUsers: 0,
        totalDeals,
        activeDeals,
        activeOffers,
        openRequests,
        pendingDisputes,
        pendingReviews: 0,
      });
    } catch (_error) {
      setError('Failed to load admin overview');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOverview();
  };

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access admin overview." />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading admin overview...</Text>
      </View>
    );
  }

  if (error && !stats) {
    return <ErrorState message={error} onRetry={loadOverview} />;
  }

  if (!stats) {
    return <EmptyState title="No overview data" description="Admin summary is currently unavailable." icon="📊" />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.note}>Live marketplace counts. User/review totals require admin API integration.</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalDeals}</Text>
          <Text style={styles.statLabel}>Total Deals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeDeals}</Text>
          <Text style={styles.statLabel}>Active Deals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeOffers}</Text>
          <Text style={styles.statLabel}>Active Offers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.openRequests}</Text>
          <Text style={styles.statLabel}>Open Requests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingDisputes}</Text>
          <Text style={styles.statLabel}>Pending Disputes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingReviews}</Text>
          <Text style={styles.statLabel}>Pending Reviews</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loading: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.sm },
  note: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  statValue: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  statLabel: { ...typography.body, color: colors.textSecondary },
});

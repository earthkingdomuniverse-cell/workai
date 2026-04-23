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

export default function AdminOverviewScreen() {
  const { isOperator } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setError(null);
      
      // Fetch real data from existing services
      const [deals, offers, requests] = await Promise.all([
        dealService.getDeals(),
        offerService.getOffers({}),
        requestService.getRequests({}),
      ]);
      
      // Calculate stats
      const totalDeals = deals.length;
      const activeDeals = deals.filter((d: any) => d.status === 'in_progress').length;
      const totalOffers = offers.length;
      const totalRequests = requests.length;
      
      // Mock additional stats (would need user service for real count)
      setStats({ 
        totalUsers: 1247, // Would need userService
        totalDeals,
        activeDeals,
        pendingDisputes: 12, // Would need dispute service
        activeOffers: totalOffers,
        openRequests: totalRequests,
        pendingReviews: 23, // Would need reviewService
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOverview(); }} />}>
      <Text style={styles.title}>Admin Dashboard</Text>
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
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.activeDisputes}</Text>
          <Text style={styles.statLabel}>Active Disputes</Text>
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
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.lg },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  statValue: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  statLabel: { ...typography.body, color: colors.textSecondary },
});

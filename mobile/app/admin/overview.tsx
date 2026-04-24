import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { adminService, AdminOverview } from '../../src/services/adminService';

export default function AdminOverviewScreen() {
  const { isOperator } = useAuth();
  const [stats, setStats] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setError(null);
      const overview = await adminService.getOverview();
      setStats(overview);
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
      <Text style={styles.note}>Live operator overview from backend admin API.</Text>

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
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.riskSignals ?? 0}</Text>
          <Text style={styles.statLabel}>Risk Signals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.fraudSignals ?? 0}</Text>
          <Text style={styles.statLabel}>Fraud Signals</Text>
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
  statCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  statValue: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  statLabel: { ...typography.body, color: colors.textSecondary },
});

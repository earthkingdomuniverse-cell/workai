import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { adminService, AdminOverview } from '../../src/services/adminService';

const adminLinks = [
  {
    title: 'Disputes',
    description: 'Resolve marketplace disputes',
    route: '/admin/disputes',
  },
  {
    title: 'Risk',
    description: 'Review high-risk profiles',
    route: '/admin/risk',
  },
  {
    title: 'Fraud',
    description: 'Inspect fraud signals',
    route: '/admin/fraud',
  },
  {
    title: 'Reviews',
    description: 'Moderate flagged reviews',
    route: '/admin/reviews',
  },
];

export default function AdminOverviewScreen() {
  const router = useRouter();
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

      <Text style={styles.sectionTitle}>Operator tools</Text>
      <View style={styles.linksGrid}>
        {adminLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            style={styles.linkCard}
            onPress={() => router.push(link.route as any)}
          >
            <Text style={styles.linkTitle}>{link.title}</Text>
            <Text style={styles.linkDescription}>{link.description}</Text>
            <Text style={styles.linkCta}>Open →</Text>
          </TouchableOpacity>
        ))}
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
  sectionTitle: { ...typography.h2, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  linksGrid: { gap: spacing.md },
  linkCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  linkTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.xs },
  linkDescription: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  linkCta: { ...typography.body, color: colors.primary, fontWeight: '700' },
});

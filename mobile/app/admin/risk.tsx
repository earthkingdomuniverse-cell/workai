import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { adminService } from '../../src/services/adminService';

function getRiskLevel(item: any) {
  return item.riskLevel || item.level || item.severity || 'medium';
}

function getRiskScore(item: any) {
  return Number(item.riskScore ?? item.score ?? item.trustScore ?? 0);
}

export default function AdminRiskScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRisk = async () => {
    try {
      setError(null);
      const response = await adminService.getRiskProfiles();
      setItems(response.items || []);
    } catch (_error) {
      setError('Failed to load risk profiles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, []);

  if (!isOperator) {
    return <AccessDeniedState message="Only operator and admin roles can access risk." />;
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading risk profiles...</Text>
      </View>
    );
  }

  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadRisk} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadRisk();
          }}
        />
      }
    >
      <Text style={styles.title}>Risk Management</Text>
      <Text style={styles.subtitle}>Operator risk profiles from backend admin API.</Text>

      {items.length === 0 ? (
        <EmptyState title="No risk profiles" description="No users currently need risk review." icon="🛡️" />
      ) : (
        items.map((item) => (
          <View key={item.userId || item.id} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.cardTitle}>{item.email || item.userId || item.id}</Text>
              <Text style={styles.badge}>{getRiskLevel(item)}</Text>
            </View>
            <Text style={styles.score}>Risk score: {getRiskScore(item)}</Text>
            <Text style={styles.meta}>Trust score: {item.trustScore ?? 'unknown'}</Text>
            <Text style={styles.meta}>Open disputes: {item.openDisputes ?? item.disputes ?? 0}</Text>
            <Text style={styles.meta}>Reviews: {item.reviewCount ?? item.reviews ?? 0}</Text>
            {Array.isArray(item.flags) && item.flags.length > 0 ? (
              <View style={styles.flags}>
                {item.flags.map((flag: any, index: number) => (
                  <Text key={`${item.userId || item.id}-flag-${index}`} style={styles.flagText}>
                    • {flag.description || flag.type || String(flag)}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loading: { ...typography.body, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, marginBottom: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.text, flex: 1 },
  badge: { ...typography.caption, color: colors.warning, fontWeight: '700', textTransform: 'uppercase' },
  score: { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  meta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
  flags: { marginTop: spacing.sm },
  flagText: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },
});

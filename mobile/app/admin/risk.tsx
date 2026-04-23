import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../src/hooks/useAuth';
import AccessDeniedState from '../../src/components/AccessDeniedState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import RiskCard from '../../src/components/RiskCard';
import { trustService } from '../../src/services/trustService';

export default function AdminRiskScreen() {
  const { isOperator } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRisk = async () => {
    try {
      setError(null);
      // Calculate risk from trust profiles
      const trustProfiles = await trustService.getTrustProfiles();

      // Check trust scores for risk assessment
      const riskItems = [];

      for (const profile of trustProfiles) {
        let riskLevel = 'low';
        let flags = [];

        if (profile.trustScore < 50) {
          riskLevel = 'high';
          flags.push({
            type: 'low_trust_score',
            description: `Trust score ${profile.trustScore} below threshold`,
          });
        } else if (profile.trustScore < 70) {
          riskLevel = 'medium';
          flags.push({ type: 'medium_trust', description: 'Moderate trust score' });
        }

        if (profile.disputeRatio > 0.1) {
          riskLevel = 'high';
          flags.push({
            type: 'high_dispute_ratio',
            description: `Dispute ratio ${(profile.disputeRatio * 100).toFixed(1)}%`,
          });
        }

        if (riskLevel !== 'low') {
          riskItems.push({
            userId: profile.userId,
            riskScore: profile.trustScore,
            riskLevel,
            flags,
          });
        }
      }

      setItems(riskItems);
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

  if (!isOperator)
    return <AccessDeniedState message="Only operator and admin roles can access risk." />;
  if (loading)
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading risk profiles...</Text>
      </View>
    );
  if (error && items.length === 0) return <ErrorState message={error} onRetry={loadRisk} />;
  if (items.length === 0)
    return (
      <EmptyState
        title="No risk profiles"
        description="No users currently need risk review."
        icon="🛡️"
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
            loadRisk();
          }}
        />
      }
    >
      <Text style={styles.title}>Risk Management</Text>
      {items.map((item) => (
        <RiskCard
          key={item.userId}
          userId={item.userId}
          riskScore={item.riskScore}
          riskLevel={item.riskLevel}
          flags={item.flags}
        />
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
});

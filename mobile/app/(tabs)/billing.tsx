import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../src/services/apiClient';
import { useAuthStore } from '../../src/store/auth-store';

type PlanLocal = {
  id: string;
  name: string;
  pricePerMonth: number;
  features: string[];
};

export default function BillingScreen() {
  const userId = useAuthStore.getState().user?.id ?? 'guest';
  const [plans, setPlans] = useState<PlanLocal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await apiClient.get<unknown>('/billing/plans');
      if (Array.isArray(res)) {
        setPlans(res);
      } else if (
        typeof res === 'object' &&
        res !== null &&
        'items' in res &&
        Array.isArray((res as { items?: unknown }).items)
      ) {
        setPlans((res as { items: PlanLocal[] }).items);
      } else {
        const arr = Object.values((res as Record<string, any>) ?? {}).map((p: any) => ({
          id: p.id,
          name: p.name,
          pricePerMonth: p.price,
          features: p.features ?? [],
        }));
        setPlans(arr as PlanLocal[]);
      }
    } catch (e) {
      console.error('Failed to load plans', e);
    } finally {
      setLoading(false);
    }
  };

  const subscribe = async (planId: string) => {
    try {
      const resp = await apiClient.post('/billing/subscribe', { userId, planId });
      // Simple feedback
      alert(`Subscribed to ${planId}.`);
      console.log('subscribe response', resp);
    } catch (e) {
      console.warn('subscribe failed', e);
      alert('Subscription failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Billing & Plans</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" />
      ) : (
        plans.map((p) => (
          <View key={p.id} style={styles.card}>
            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planPrice}>${p.pricePerMonth}/month</Text>
            <View style={styles.featureList}>
              {p.features.map((f, idx) => (
                <Text key={idx} style={styles.featureItem}>
                  • {f}
                </Text>
              ))}
            </View>
            <TouchableOpacity style={styles.subscribeBtn} onPress={() => subscribe(p.id)}>
              <Text style={styles.subscribeBtnText}>Choose</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#1f2a3a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  planName: { fontSize: 18, fontWeight: '700', color: '#fff' },
  planPrice: { fontSize: 20, fontWeight: '800', color: '#93c5fd', marginVertical: 6 },
  featureList: { marginVertical: 6 },
  featureItem: { color: '#cbd5e1', fontSize: 14 },
  subscribeBtn: {
    backgroundColor: '#38bdf8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  subscribeBtnText: { color: '#001018', fontWeight: '700' },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../../src/services/apiClient';
import type { Thread } from './types';

type Props = {};

export default function SkillExchangeList(_props: Props) {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await apiClient.get<any>('/skill-exchange/threads');
      // Normalize response
      const items = res?.length !== undefined ? (res as Thread[]) : (res?.items ?? []);
      setThreads(items as Thread[]);
    } catch (e) {
      console.error('Failed to fetch skill-exchange threads', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.topic.toLowerCase().includes(search.toLowerCase()),
  );
  const openThread = (id: string) => {
    router.push(`/skill-exchange/${id}`);
  };

  const renderItem = ({ item }: { item: Thread }) => (
    <TouchableOpacity style={styles.card} onPress={() => openThread(item.id)}>
      <Text style={styles.title}>{item.topic}</Text>
      <Text style={styles.subtitle}>
        {item.status} • created {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Skill Exchange Threads</Text>
      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm threads..."
        value={search}
        onChangeText={setSearch}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" />
      ) : (
        <FlatList data={filteredThreads} renderItem={renderItem} keyExtractor={(t) => t.id} />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/skill-exchange/create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0f172a' },
  header: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 8 },
  search: {
    backgroundColor: '#1f2a3a',
    borderColor: '#334155',
    borderRadius: 8,
    borderWidth: 1,
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#1f2a3a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 6,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 12, color: '#9fb2d1' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#001018', fontSize: 28, lineHeight: 28, fontWeight: '900' },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../../src/services/apiClient';
import { useAuthStore } from '../../../src/store/auth-store';
import type { Thread } from './types';

export default function ThreadDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const userId = useAuthStore.getState().user?.id ?? 'guest';

  useEffect(() => {
    if (typeof id === 'string') {
      void loadThread(id);
    }
  }, [id]);

  const loadThread = async (tid: string) => {
    try {
      const res = await apiClient.get<any>(`/skill-exchange/threads/${tid}`);
      setThread(res as Thread);
    } catch (e) {
      console.error('Failed to load thread', e);
    } finally {
      setLoading(false);
    }
  };

  const postMessage = async () => {
    if (!thread || !message.trim()) return;
    try {
      await apiClient.post(`/skill-exchange/threads/${thread.id}/messages`, {
        senderId: userId,
        text: message,
      });
      setMessage('');
      await loadThread(thread.id);
    } catch (e) {
      console.error('Failed to post message', e);
      setMessage('');
    }
  };

  if (loading || !thread) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{thread.topic}</Text>
      <Text style={styles.meta}>
        {thread.status} • {new Date(thread.createdAt).toLocaleDateString()}
      </Text>
      <View style={styles.messages}>
        {(thread.messages || []).map((m: any) => (
          <Text key={m.id} style={styles.message}>
            {m.senderId}: {m.text}
          </Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Write a message..."
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity style={styles.send} onPress={postMessage}>
        <Text style={styles.sendText}>Send</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  title: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#9fb2d1', marginBottom: 8 },
  messages: { marginVertical: 8, paddingVertical: 4, borderTopWidth: 1, borderTopColor: '#334155' },
  message: { marginVertical: 4 },
  input: {
    height: 40,
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  send: {
    marginTop: 8,
    backgroundColor: '#38bdf8',
    padding: 10,
    borderRadius: 6,
    width: 80,
    alignItems: 'center',
  },
  sendText: { color: '#001018', fontWeight: '700' },
});

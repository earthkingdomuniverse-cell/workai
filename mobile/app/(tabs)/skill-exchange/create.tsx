import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/store/auth-store';
import { apiClient } from '../../../src/services/apiClient';

export default function CreateThreadScreen() {
  const router = useRouter();
  const userId = useAuthStore.getState().user?.id ?? 'guest';
  const [topic, setTopic] = useState('');

  const createThread = async () => {
    if (!topic.trim()) {
      Alert.alert('Please enter a topic');
      return;
    }
    try {
      const res = await apiClient.post('/skill-exchange/threads', {
        creatorId: userId,
        topic: topic.trim(),
      });
      router.back();
      Alert.alert('Thread created', res?.id ? `Thread ${res.id} created` : 'Created');
    } catch (e) {
      Alert.alert('Failed to create thread');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Skill Exchange Thread</Text>
      <TextInput
        style={styles.input}
        placeholder="Topic / Skill area"
        value={topic}
        onChangeText={setTopic}
      />
      <View style={styles.actions}>
        <Button title="Create" onPress={createThread} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 8, padding: 8, fontSize: 16 },
  actions: { marginTop: 12 },
});

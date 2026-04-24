import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { apiClient } from '../../src/services/apiClient'
import { useAuthStore } from '../../src/store/auth-store'

export default function WalletScreen() {
  const userId = useAuthStore.getState().user?.id ?? 'guest'
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    // In MVP, balance is stored on the server; fetch if available. We'll simulate with a call to a mock endpoint if exists
    loadBalance()
  }, [])

  const loadBalance = async () => {
    try {
      // If there's an endpoint, call it. Otherwise simulate
      const resp = await apiClient.get<any>('/billing/ai/agents')
      // If response exists and length > 0, sum wallets
      const agents = Array.isArray(resp) ? resp : []
      const total = agents.reduce((acc, a) => acc + (a?.wallet ?? 0), 0)
      setBalance(total)
    } catch {
      // simulate balance
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Wallet</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#38bdf8" />
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Balance</Text>
          <Text style={styles.balance}>${balance}</Text>
          <Text style={styles.small}>Credits available for AI actions</Text>
          <TouchableOpacity style={styles.button} onPress={() => alert('Top up flow coming soon')}>
            <Text style={styles.buttonText}>Add Credits</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  card: { backgroundColor: '#1f2a3a', borderRadius: 12, padding: 16, marginTop: 8 },
  label: { color: '#a3a3a3', fontSize: 14 },
  balance: { fontSize: 28, fontWeight: '700', marginVertical: 6 },
  small: { color: '#9fb2d1', fontSize: 12 },
  button: { marginTop: 12, padding: 12, backgroundColor: '#38bdf8', borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#001018', fontWeight: '700' },
});

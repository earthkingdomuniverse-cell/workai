import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';

interface MessageThread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
  type: 'deal' | 'proposal' | 'direct';
}

export default function InboxScreen() {
  const router = useRouter();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockThreads: MessageThread[] = [
        {
          id: '1',
          name: 'John Doe',
          lastMessage: 'Thanks for the update on the project!',
          timestamp: new Date().toISOString(),
          unread: 2,
          type: 'deal',
        },
        {
          id: '2',
          name: 'Jane Smith',
          lastMessage: 'Can we schedule a call tomorrow?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          unread: 0,
          type: 'proposal',
        },
        {
          id: '3',
          name: 'E-commerce Project',
          lastMessage: 'The design looks great!',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          unread: 1,
          type: 'deal',
        },
      ];
      setThreads(mockThreads);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadThreads();
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading messages..." />;
  }

  if (error && threads.length === 0) {
    return <ErrorState message={error} onRetry={loadThreads} />;
  }

  if (threads.length === 0) {
    return (
      <EmptyState
        title="No messages yet"
        description="Start a conversation with other users"
        icon="💬"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.threadCard}
            onPress={() => router.push(`/messages/${item.id}` as any)}
          >
            <View style={styles.avatar}>
              {item.avatar ? (
                <Text style={styles.avatarImage}>{item.avatar}</Text>
              ) : (
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.threadContent}>
              <View style={styles.threadHeader}>
                <Text style={styles.threadName}>{item.name}</Text>
                <Text style={styles.threadTime}>{formatTime(item.timestamp)}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContent: {
    paddingTop: theme.spacing.xl,
  },
  threadCard: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    marginBottom: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarImage: {
    fontSize: 20,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[950],
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  threadName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  threadTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  lastMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  unreadText: {
    color: theme.colors.primary[950],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

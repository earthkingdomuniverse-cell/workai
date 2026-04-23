import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { LoadingState } from '../../components/LoadingState';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';

interface ActivityItem {
  id: string;
  type: 'deal' | 'proposal' | 'message' | 'review' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

export default function ActivityScreen() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'deal',
          title: 'Deal Created',
          description: 'Mobile App UI Design deal has been created',
          timestamp: new Date().toISOString(),
          read: false,
          icon: '💼',
        },
        {
          id: '2',
          type: 'proposal',
          title: 'Proposal Received',
          description: 'You received a new proposal for E-commerce Platform',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          icon: '📝',
        },
        {
          id: '3',
          type: 'review',
          title: 'New Review',
          description: 'You received a 5-star review from John Doe',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          icon: '⭐',
        },
        {
          id: '4',
          type: 'payment',
          title: 'Payment Received',
          description: 'You received $1,000.00 for Mobile App UI Design',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true,
          icon: '💰',
        },
        {
          id: '5',
          type: 'message',
          title: 'New Message',
          description: 'Jane Smith sent you a message',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          read: true,
          icon: '💬',
        },
      ];
      setActivities(mockActivities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  const markAsRead = (id: string) => {
    setActivities((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  if (loading) {
    return <LoadingState fullScreen message="Loading activity..." />;
  }

  if (error && activities.length === 0) {
    return <ErrorState message={error} onRetry={loadActivities} />;
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Your activity feed will appear here"
        icon="📋"
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
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
            style={[styles.activityCard, !item.read && styles.activityCardUnread]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.activityIcon}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityDescription}>{item.description}</Text>
              <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
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
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
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
  activityCard: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    marginBottom: 1,
    alignItems: 'center',
  },
  activityCardUnread: {
    backgroundColor: theme.colors.primary[900] + '20',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  activityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  activityTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
  },
});

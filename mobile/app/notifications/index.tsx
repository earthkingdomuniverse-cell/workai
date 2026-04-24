import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import notificationService, {
  type Notification,
  type NotificationType,
} from '../../src/services/notificationService';
import LoadingState from '../../components/LoadingState';

const Icon = Ionicons as unknown as React.ComponentType<any>;

const notificationIcons: Record<NotificationType, string> = {
  message: 'chatbubble',
  deal_update: 'briefcase',
  proposal_received: 'document-text',
  proposal_accepted: 'checkmark-circle',
  payment_received: 'cash',
  review_received: 'star',
  trust_update: 'shield-checkmark',
  system: 'information-circle',
};

const notificationColors: Record<NotificationType, string> = {
  message: colors.primary,
  deal_update: colors.success,
  proposal_received: colors.warning,
  proposal_accepted: colors.success,
  payment_received: colors.success,
  review_received: colors.warning,
  trust_update: colors.info,
  system: colors.textSecondary,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const [notificationsData, countData] = await Promise.all([
        notificationService.getNotifications({ limit: 50 }),
        notificationService.getUnreadCount(),
      ]);

      setNotifications(notificationsData.items);
      setUnreadCount(countData);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications. Pull down to retry.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications(false);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      setIsMarkingAll(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          readAt: n.readAt || new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await notificationService.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
          } catch (err) {
            console.error('Error deleting notification:', err);
            Alert.alert('Error', 'Failed to delete notification');
          }
        },
      },
    ]);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View
          style={[styles.iconContainer, { backgroundColor: notificationColors[item.type] + '20' }]}
        >
          <Icon
            name={notificationIcons[item.type] as any}
            size={24}
            color={notificationColors[item.type]}
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="close" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingState message="Loading notifications..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={handleMarkAllAsRead}
                disabled={isMarkingAll}
              >
                {isMarkingAll ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.markAllText}>Mark all read</Text>
                )}
              </TouchableOpacity>
            ),
        }}
      />

      {notifications.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>We'll notify you when something important happens</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  markAllButton: {
    paddingHorizontal: spacing.md,
  },
  markAllText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
  },
  notificationCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    backgroundColor: colors.card,
    borderColor: colors.primary + '30',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  unreadText: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    ...typography.body,
    fontWeight: '600',
  },
});

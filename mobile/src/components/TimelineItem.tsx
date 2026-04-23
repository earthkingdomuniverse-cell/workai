import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'milestone_update' | 'message' | 'payment' | 'dispute';
  title: string;
  description?: string;
  status?: string;
  amount?: number;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface TimelineItemProps {
  event: TimelineEvent;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ event }) => {
  const getEventTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'status_change':
        return '🔄';
      case 'milestone_update':
        return '✅';
      case 'message':
        return '💬';
      case 'payment':
        return '💰';
      case 'dispute':
        return '⚠️';
      default:
        return '🔹';
    }
  };

  const getEventTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'status_change':
        return colors.primary;
      case 'milestone_update':
        return colors.success;
      case 'message':
        return colors.info;
      case 'payment':
        return colors.warning;
      case 'dispute':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const formatAmount = (amount: number) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getEventTypeIcon(event.type)}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.timestamp}>{new Date(event.createdAt).toLocaleString()}</Text>
        </View>
        {event.description && <Text style={styles.description}>{event.description}</Text>}
        {event.amount && <Text style={styles.amount}>Amount: {formatAmount(event.amount)}</Text>}
        <View style={styles.footer}>
          <Text style={styles.user}>By {event.userName}</Text>
          {event.status && (
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getEventTypeColor(event.type) + '15' },
              ]}
            >
              <Text style={[styles.statusText, { color: getEventTypeColor(event.type) }]}>
                {event.status}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  amount: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  user: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default TimelineItem;

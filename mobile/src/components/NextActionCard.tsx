import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';

interface NextAction {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cta: string;
  route: string;
  icon: string;
  context?: any;
  deadline?: string;
}

interface NextActionCardProps {
  action: NextAction;
  onPress: (action: NextAction) => void;
}

const NextActionCard: React.FC<NextActionCardProps> = ({ action, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
      case 'urgent':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(action)} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>{action.icon}</Text>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(action.priority) + '15' },
          ]}
        >
          <Text style={[styles.priorityText, { color: getPriorityColor(action.priority) }]}>
            {action.priority}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.description}>{action.description}</Text>

      <View style={styles.footer}>
        <Text style={styles.cta}>{action.cta}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  priorityText: {
    ...typography.caption,
    fontWeight: '600',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cta: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default NextActionCard;

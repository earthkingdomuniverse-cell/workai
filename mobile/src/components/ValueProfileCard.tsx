import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { SkillTagList, Skill } from './SkillTagList';

interface Goal {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  priority?: 'low' | 'medium' | 'high';
}

interface ValueProfileCardProps {
  role: string;
  skills: Skill[];
  goals: Goal[];
  completionPercentage: number;
  completed: boolean;
  onSkillPress?: (skill: Skill) => void;
  onGoalPress?: (goal: Goal) => void;
  showProgress?: boolean;
  compact?: boolean;
}

export function ValueProfileCard({
  role,
  skills,
  goals,
  completionPercentage,
  completed,
  onSkillPress,
  onGoalPress,
  showProgress = true,
  compact = false,
}: ValueProfileCardProps) {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Value Profile</Text>
        <View style={[styles.roleBadge, getRoleBadgeStyle(role)]}>
          <Text style={[styles.roleText, getRoleTextStyle(role)]}>{role}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Profile Completion</Text>
            <Text style={styles.progressValue}>{completionPercentage}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(0, Math.min(completionPercentage, 100))}%` },
              ]}
            />
          </View>
          {completed && <Text style={styles.completedText}>✓ Profile Complete</Text>}
        </View>
      )}

      {/* Skills Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionCount}>{skills.length}</Text>
        </View>
        <SkillTagList skills={skills} onSkillPress={onSkillPress} compact={compact} />
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <Text style={styles.sectionCount}>
            {activeGoals.length} active, {completedGoals.length} completed
          </Text>
        </View>
        {goals.length > 0 ? (
          <View style={styles.goalsList}>
            {goals.slice(0, compact ? 3 : undefined).map((goal) => (
              <View
                key={goal.id}
                style={[styles.goalItem, goal.status === 'completed' && styles.goalItemCompleted]}
              >
                <Text
                  style={[
                    styles.goalTitle,
                    goal.status === 'completed' && styles.goalTitleCompleted,
                  ]}
                >
                  {goal.status === 'completed' ? '✓ ' : ''}
                  {goal.title}
                </Text>
                {goal.description && (
                  <Text style={styles.goalDescription} numberOfLines={1}>
                    {goal.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No goals set</Text>
        )}
      </View>
    </View>
  );
}

function getRoleBadgeStyle(role: string) {
  const styleMap: any = {
    member: { backgroundColor: theme.colors.primary[900], borderColor: theme.colors.primary[700] },
    operator: {
      backgroundColor: theme.colors.secondary[900],
      borderColor: theme.colors.secondary[700],
    },
    admin: {
      backgroundColor: theme.colors.error.main + '20',
      borderColor: theme.colors.error.main,
    },
  };
  return styleMap[role] || styleMap.member;
}

function getRoleTextStyle(role: string) {
  const colorMap: any = {
    member: { color: theme.colors.primary[300] },
    operator: { color: theme.colors.secondary[300] },
    admin: { color: theme.colors.error.light },
  };
  return colorMap[role] || colorMap.member;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  containerCompact: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  progressValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary[400],
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.background.tertiary,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
  },
  completedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success.main,
    marginTop: theme.spacing.xs,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  sectionCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  goalsList: {
    gap: theme.spacing.sm,
  },
  goalItem: {
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  goalItemCompleted: {
    opacity: 0.7,
  },
  goalTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.tertiary,
  },
  goalDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export interface Skill {
  id: string;
  name: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  verified?: boolean;
}

interface SkillTagListProps {
  skills: Skill[];
  onRemove?: (skill: Skill) => void;
  onSkillPress?: (skill: Skill) => void;
  showLevel?: boolean;
  showYears?: boolean;
  compact?: boolean;
}

export function SkillTagList({
  skills,
  onRemove,
  onSkillPress,
  showLevel = true,
  showYears = false,
  compact = false,
}: SkillTagListProps) {
  if (skills.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No skills added yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {skills.map((skill) => (
        <TouchableOpacity
          key={skill.id}
          style={[styles.skillTag, compact && styles.skillTagCompact, getLevelStyle(skill.level)]}
          onPress={() => onSkillPress?.(skill)}
          activeOpacity={0.7}
        >
          <View style={styles.skillTagContent}>
            <Text style={[styles.skillName, compact && styles.skillNameCompact]}>{skill.name}</Text>
            {showLevel && skill.level && (
              <Text style={[styles.levelText, getLevelTextStyle(skill.level)]}>{skill.level}</Text>
            )}
            {showYears && skill.yearsOfExperience && (
              <Text style={styles.yearsText}>{skill.yearsOfExperience}y</Text>
            )}
            {skill.verified && <Text style={styles.verifiedIcon}>✓</Text>}
          </View>
          {onRemove && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(skill)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getLevelStyle(level?: string) {
  const styleMap: any = {
    beginner: { borderColor: theme.colors.neutral[500] },
    intermediate: { borderColor: theme.colors.info.main },
    advanced: { borderColor: theme.colors.primary[500] },
    expert: { borderColor: theme.colors.secondary[500] },
  };
  return styleMap[level] || {};
}

function getLevelTextStyle(level: string) {
  const colorMap: any = {
    beginner: theme.colors.neutral[400],
    intermediate: theme.colors.info.main,
    advanced: theme.colors.primary[400],
    expert: theme.colors.secondary[400],
  };
  return { color: colorMap[level] || theme.colors.text.tertiary };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  emptyContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.surface.border,
  },
  skillTagCompact: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  skillTagContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  skillName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  skillNameCompact: {
    fontSize: theme.typography.fontSize.xs,
  },
  levelText: {
    fontSize: theme.typography.fontSize.xxs,
    fontWeight: theme.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  yearsText: {
    fontSize: theme.typography.fontSize.xxs,
    color: theme.colors.text.tertiary,
  },
  verifiedIcon: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success.main,
    marginLeft: theme.spacing.xs,
  },
  removeButton: {
    marginLeft: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.surface.border,
  },
  removeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
});

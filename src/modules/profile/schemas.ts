import { z } from 'zod';
import { UserRole } from '../auth/types';

export const onboardingSchema = z.object({
  role: z.enum(['member', 'operator', 'admin']) as unknown as z.ZodType<UserRole>,
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
  location: z.string().optional(),
  website: z.string().url('Invalid URL').optional(),
});

export const addSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: z.number().optional(),
});

export const addGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  targetDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

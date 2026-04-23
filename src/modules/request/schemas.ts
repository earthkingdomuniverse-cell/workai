import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  category: z.string().optional(),
  budget: z
    .object({
      min: z.number().positive('Minimum budget must be positive'),
      max: z.number().positive('Maximum budget must be positive'),
      currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'VND']).default('USD'),
      negotiable: z.boolean().default(true),
    })
    .optional(),
  skills: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  location: z
    .object({
      type: z.enum(['remote', 'onsite', 'hybrid']),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  duration: z
    .object({
      value: z.number().positive(),
      unit: z.enum(['hours', 'days', 'weeks', 'months']),
    })
    .optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const updateRequestSchema = createRequestSchema.partial();

export const requestFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'archived']).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  location: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  requesterId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'budget', 'proposals', 'urgency', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type RequestFilter = z.infer<typeof requestFilterSchema>;

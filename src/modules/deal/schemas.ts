import { z } from 'zod';

export const createDealSchema = z.object({
  offerId: z.string().optional(),
  requestId: z.string().optional(),
  proposalId: z.string().optional(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'VND']).default('USD'),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        dueDate: z.string().optional(),
      }),
    )
    .optional(),
  attachments: z.array(z.string().url()).optional(),
});

export const fundDealSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  savePaymentMethod: z.boolean().optional(),
});

export const submitWorkSchema = z.object({
  milestoneId: z.string().min(1, 'Milestone ID is required'),
  attachments: z.array(z.string().url()).optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const releaseFundsSchema = z.object({
  milestoneId: z.string().optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const createDisputeSchema = z.object({
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be less than 500 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  attachments: z.array(z.string().url()).optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z
    .string()
    .min(10, 'Resolution must be at least 10 characters')
    .max(2000, 'Resolution must be less than 2000 characters'),
  refundAmount: z.number().nonnegative('Refund amount must be non-negative').optional(),
  notes: z.string().max(2000, 'Notes must be less than 2000 characters').optional(),
});

export const dealFilterSchema = z.object({
  providerId: z.string().optional(),
  clientId: z.string().optional(),
  status: z
    .enum(['created', 'funded', 'submitted', 'released', 'disputed', 'refunded', 'under_review'])
    .optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type FundDealInput = z.infer<typeof fundDealSchema>;
export type SubmitWorkInput = z.infer<typeof submitWorkSchema>;
export type ReleaseFundsInput = z.infer<typeof releaseFundsSchema>;
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type DealFilter = z.infer<typeof dealFilterSchema>;

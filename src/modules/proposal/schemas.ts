import { z } from 'zod';

const proposalCoreSchema = z.object({
  requestId: z.string().optional(),
  offerId: z.string().optional(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  proposedAmount: z.number().positive('Proposed amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'VND']).default('USD'),
  estimatedDeliveryDays: z.number().int().positive('Delivery days must be positive'),
  revisions: z.number().int().min(0).max(10).optional(),
  attachments: z.array(z.string().url()).optional(),
  milestones: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        amount: z.number(),
        dueDate: z.string().optional(),
        completed: z.boolean().default(false),
      }),
    )
    .optional(),
});

export const createProposalSchema = proposalCoreSchema.superRefine((value, ctx) => {
  if (!value.requestId && !value.offerId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either requestId or offerId is required',
      path: ['requestId'],
    });
  }
});

export const updateProposalSchema = proposalCoreSchema.partial();

export const proposalFilterSchema = z.object({
  requestId: z.string().optional(),
  offerId: z.string().optional(),
  providerId: z.string().optional(),
  clientId: z.string().optional(),
  status: z
    .enum(['pending', 'accepted', 'rejected', 'expired', 'withdrawn', 'negotiating'])
    .optional(),
  sortBy: z.enum(['createdAt', 'amount', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
export type ProposalFilter = z.infer<typeof proposalFilterSchema>;

import { z } from 'zod';

export const createOfferSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  category: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'JPY', 'VND']).default('USD'),
  pricingType: z.enum(['fixed', 'hourly', 'negotiable']).default('fixed'),
  skills: z.array(z.string()).optional(),
  deliveryDays: z.number().int().positive().optional(),
  revisions: z.number().int().min(0).max(10).optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateOfferSchema = createOfferSchema.partial();

export const offerFilterSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  pricingType: z.enum(['fixed', 'hourly', 'negotiable']).optional(),
  skills: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'archived', 'completed']).optional(),
  providerId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'price', 'popularity', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export type OfferFilter = z.infer<typeof offerFilterSchema>;

import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(1).max(128),
  isActive: z.boolean().optional().default(true)
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  password: z.string().min(1).max(128).optional(),
  isActive: z.boolean().optional()
});

export const customerIdParamSchema = z.object({
  id: z.string().cuid()
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

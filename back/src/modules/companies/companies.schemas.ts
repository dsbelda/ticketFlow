import { z } from 'zod';

export const updateCompanySettingsSchema = z.object({
  name: z.string().min(2).max(120),
  logoUrl: z.string().url().optional().or(z.literal(''))
});

export const validateDbConfigSchema = z.object({
  database: z.object({
    host: z.string().min(1),
    port: z.coerce.number().int().positive().max(65535).default(5432),
    user: z.string().min(1),
    password: z.string().default(''),
    name: z.string().min(1),
    mode: z.enum(['create', 'existing']).default('existing')
  })
});

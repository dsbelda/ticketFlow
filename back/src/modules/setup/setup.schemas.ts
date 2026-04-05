import { z } from 'zod';

export const setupStatusSchema = z.object({});
export const databaseConfigSchema = z.object({
  host: z.string().min(1),
  port: z.coerce.number().int().positive().max(65535).default(5432),
  user: z.string().min(1),
  password: z.string().default(''),
  name: z.string().min(1),
  mode: z.enum(['create', 'existing']).default('existing')
});

export const installSetupSchema = z.object({
  companyName: z.string().min(2).max(120),
  companyLogoUrl: z.string().url().optional().or(z.literal('')),
  adminEmail: z.string().email(),
  database: databaseConfigSchema
});

export const validateDatabaseSchema = z.object({
  database: databaseConfigSchema
});

export type InstallSetupInput = z.infer<typeof installSetupSchema>;
export type ValidateDatabaseInput = z.infer<typeof validateDatabaseSchema>;

import { z } from 'zod';

export const updateMyProfileSchema = z.object({
  name: z.string().min(2).max(120)
});

export const changeMyPasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(8).max(128)
});

export const createAdminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const updateAdminSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional()
});

export const userIdParamSchema = z.object({
  id: z.string().cuid()
});

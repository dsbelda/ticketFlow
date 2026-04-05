import { z } from 'zod';

export const ticketIdParamSchema = z.object({
  ticketId: z.string().cuid()
});

export const createMessageSchema = z.object({
  body: z.string().min(1).max(5000),
  internal: z.boolean().optional().default(false)
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;

import { TicketPriority } from '@prisma/client';
import { z } from 'zod';

export const createPortalTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  description: z.string().min(3).max(5000),
  priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM)
});

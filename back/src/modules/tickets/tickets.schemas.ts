import { TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';

export const listTicketsQuerySchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  customerId: z.string().cuid().optional(),
  assignedUserId: z.string().cuid().optional(),
  search: z.string().min(1).max(200).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10)
});

export const ticketIdParamSchema = z.object({
  id: z.string().cuid()
});

export const createTicketSchema = z.object({
  customerId: z.string().cuid(),
  assignedUserId: z.string().cuid().optional().nullable(),
  subject: z.string().min(3).max(200),
  description: z.string().min(3).max(5000),
  priority: z.nativeEnum(TicketPriority).optional().default(TicketPriority.MEDIUM),
  status: z.nativeEnum(TicketStatus).optional().default(TicketStatus.OPEN)
});

export const updateTicketSchema = z.object({
  customerId: z.string().cuid().optional(),
  assignedUserId: z.string().cuid().nullable().optional(),
  subject: z.string().min(3).max(200).optional(),
  description: z.string().min(3).max(5000).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  status: z.nativeEnum(TicketStatus).optional()
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus)
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

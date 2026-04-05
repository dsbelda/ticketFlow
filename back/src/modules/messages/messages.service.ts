import type { FastifyInstance } from 'fastify';

import { ApiError } from '../../common/errors/api-error.js';
import type { CreateMessageInput } from './messages.schemas.js';

async function assertTicketForCompany(app: FastifyInstance, ticketId: string, companyId: string) {
  const ticket = await app.prisma.ticket.findFirst({ where: { id: ticketId, companyId } });
  if (!ticket) {
    throw new ApiError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
  }
}

export async function listMessages(app: FastifyInstance, companyId: string, ticketId: string) {
  await assertTicketForCompany(app, ticketId, companyId);

  return app.prisma.message.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, email: true } }
    }
  });
}

export async function createMessage(
  app: FastifyInstance,
  companyId: string,
  ticketId: string,
  userId: string,
  payload: CreateMessageInput
) {
  await assertTicketForCompany(app, ticketId, companyId);

  return app.prisma.message.create({
    data: {
      ticketId,
      userId,
      body: payload.body,
      internal: payload.internal
    }
  });
}

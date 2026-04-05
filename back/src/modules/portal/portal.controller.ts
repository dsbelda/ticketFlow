import type { FastifyReply, FastifyRequest } from 'fastify';
import { TicketStatus } from '@prisma/client';

import { ApiError } from '../../common/errors/api-error.js';
import { parseOrThrow } from '../../common/validators/zod.js';
import { createPortalTicketSchema } from './portal.schemas.js';

export async function createTicket(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(createPortalTicketSchema, request.body);

  if (request.customerAuth == null) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing customer session');
  }

  const customer = await request.server.prisma.customer.findFirst({
    where: {
      id: request.customerAuth.customerId,
      companyId: request.customerAuth.companyId,
      isActive: true
    }
  });

  if (customer == null) {
    throw new ApiError(403, 'FORBIDDEN', 'Customer not allowed');
  }

  const ticket = await request.server.prisma.ticket.create({
    data: {
      companyId: customer.companyId,
      customerId: customer.id,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      status: TicketStatus.OPEN
    },
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      createdAt: true
    }
  });

  return reply.status(201).send(ticket);
}

export async function listTickets(request: FastifyRequest, reply: FastifyReply) {
  if (request.customerAuth == null) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing customer session');
  }

  const tickets = await request.server.prisma.ticket.findMany({
    where: {
      companyId: request.customerAuth.companyId,
      customerId: request.customerAuth.customerId
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return reply.send({ items: tickets });
}

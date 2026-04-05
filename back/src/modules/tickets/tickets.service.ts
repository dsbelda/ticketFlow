import type { FastifyInstance } from 'fastify';

import { ApiError } from '../../common/errors/api-error.js';
import type { CreateTicketInput, ListTicketsQuery, UpdateTicketInput } from './tickets.schemas.js';

async function assertCustomerInCompany(app: FastifyInstance, companyId: string, customerId: string) {
  const customer = await app.prisma.customer.findFirst({ where: { id: customerId, companyId } });
  if (!customer) {
    throw new ApiError(400, 'INVALID_CUSTOMER', 'Customer does not belong to your company');
  }
}

async function assertAssignedUserInCompany(app: FastifyInstance, companyId: string, assignedUserId: string | null | undefined) {
  if (!assignedUserId) {
    return;
  }

  const user = await app.prisma.user.findFirst({ where: { id: assignedUserId, companyId, isActive: true } });
  if (!user) {
    throw new ApiError(400, 'INVALID_ASSIGNEE', 'Assigned user does not belong to your company');
  }
}

export async function listTickets(app: FastifyInstance, companyId: string, query: ListTicketsQuery) {
  const where = {
    companyId,
    status: query.status,
    priority: query.priority,
    customerId: query.customerId,
    assignedUserId: query.assignedUserId,
    subject: query.search
      ? {
          contains: query.search,
          mode: 'insensitive' as const
        }
      : undefined
  };

  const [items, total] = await Promise.all([
    app.prisma.ticket.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        },
        assignedUser: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    }),
    app.prisma.ticket.count({ where })
  ]);

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total
    }
  };
}

export async function getTicketById(app: FastifyInstance, companyId: string, ticketId: string) {
  const ticket = await app.prisma.ticket.findFirst({
    where: {
      id: ticketId,
      companyId
    },
    include: {
      customer: {
        select: { id: true, name: true, email: true }
      },
      assignedUser: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  if (!ticket) {
    throw new ApiError(404, 'TICKET_NOT_FOUND', 'Ticket not found');
  }

  return ticket;
}

export async function createTicket(app: FastifyInstance, companyId: string, payload: CreateTicketInput) {
  await assertCustomerInCompany(app, companyId, payload.customerId);
  await assertAssignedUserInCompany(app, companyId, payload.assignedUserId);

  return app.prisma.ticket.create({
    data: {
      companyId,
      customerId: payload.customerId,
      assignedUserId: payload.assignedUserId,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      status: payload.status
    }
  });
}

export async function updateTicket(
  app: FastifyInstance,
  companyId: string,
  ticketId: string,
  payload: UpdateTicketInput
) {
  await getTicketById(app, companyId, ticketId);

  if (payload.customerId) {
    await assertCustomerInCompany(app, companyId, payload.customerId);
  }

  if (payload.assignedUserId !== undefined) {
    await assertAssignedUserInCompany(app, companyId, payload.assignedUserId);
  }

  return app.prisma.ticket.update({
    where: { id: ticketId },
    data: payload
  });
}

export async function updateTicketStatus(
  app: FastifyInstance,
  companyId: string,
  ticketId: string,
  status: UpdateTicketInput['status']
) {
  await getTicketById(app, companyId, ticketId);

  return app.prisma.ticket.update({
    where: { id: ticketId },
    data: { status }
  });
}

export async function deleteTicket(app: FastifyInstance, companyId: string, ticketId: string) {
  await getTicketById(app, companyId, ticketId);

  await app.prisma.ticket.delete({
    where: { id: ticketId }
  });

  return { success: true };
}

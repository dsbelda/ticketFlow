import type { FastifyInstance } from 'fastify';

import { ApiError } from '../../common/errors/api-error.js';
import { hashPassword } from '../../common/utils/password.js';
import type { CreateCustomerInput, UpdateCustomerInput } from './customers.schemas.js';

export async function listCustomers(app: FastifyInstance, companyId: string) {
  return app.prisma.customer.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      companyId: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function createCustomer(app: FastifyInstance, companyId: string, payload: CreateCustomerInput) {
  const passwordHash = await hashPassword(payload.password);

  return app.prisma.customer.create({
    data: {
      companyId,
      name: payload.name,
      email: payload.email,
      passwordHash,
      isActive: payload.isActive
    },
    select: {
      id: true,
      companyId: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateCustomer(
  app: FastifyInstance,
  companyId: string,
  customerId: string,
  payload: UpdateCustomerInput
) {
  const existing = await app.prisma.customer.findFirst({
    where: { id: customerId, companyId }
  });

  if (!existing) {
    throw new ApiError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
  }

  const passwordHash = payload.password ? await hashPassword(payload.password) : undefined;

  return app.prisma.customer.update({
    where: { id: customerId },
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      isActive: payload.isActive
    },
    select: {
      id: true,
      companyId: true,
      name: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import { validateDbConfigSchema, updateCompanySettingsSchema } from './companies.schemas.js';
import { validateDatabaseConfig } from '../setup/setup.service.js';

export async function getCurrentCompany(request: FastifyRequest, reply: FastifyReply) {
  const company = await request.server.prisma.company.findUnique({
    where: { id: request.user.companyId }
  });
  return reply.send(company);
}

export async function updateCurrentCompany(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(updateCompanySettingsSchema, request.body);

  const company = await request.server.prisma.company.update({
    where: { id: request.user.companyId },
    data: {
      name: payload.name,
      logoUrl: payload.logoUrl?.trim() ? payload.logoUrl : null
    }
  });

  return reply.send(company);
}

export async function validateDbConnection(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(validateDbConfigSchema, request.body);
  const result = await validateDatabaseConfig(request.server, payload);
  return reply.send(result);
}

import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import { installSetupSchema, validateDatabaseSchema } from './setup.schemas.js';
import * as setupService from './setup.service.js';

export async function status(request: FastifyRequest, reply: FastifyReply) {
  const data = await setupService.getSetupStatus(request.server);
  return reply.send(data);
}

export async function install(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(installSetupSchema, request.body);
  const data = await setupService.installSetup(request.server, payload);
  return reply.status(201).send(data);
}

export async function validateDatabase(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(validateDatabaseSchema, request.body);
  const data = await setupService.validateDatabaseConfig(request.server, payload);
  return reply.send(data);
}

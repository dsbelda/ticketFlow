import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import {
  changeMyPasswordSchema,
  createAdminSchema,
  updateAdminSchema,
  updateMyProfileSchema,
  userIdParamSchema
} from './users.schemas.js';
import * as usersService from './users.service.js';

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const data = await usersService.me(request.server, request.user.userId);
  return reply.send(data);
}

export async function updateMyProfile(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(updateMyProfileSchema, request.body);
  const data = await usersService.updateMyProfile(request.server, request.user.userId, payload);
  return reply.send(data);
}

export async function changeMyPassword(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(changeMyPasswordSchema, request.body);
  const data = await usersService.changeMyPassword(request.server, request.user.userId, payload);
  return reply.send(data);
}

export async function listAdmins(request: FastifyRequest, reply: FastifyReply) {
  const data = await usersService.listAdmins(request.server, request.user.companyId);
  return reply.send(data);
}

export async function createAdmin(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(createAdminSchema, request.body);
  const data = await usersService.createAdmin(request.server, request.user.companyId, payload);
  return reply.status(201).send(data);
}

export async function updateAdmin(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(userIdParamSchema, request.params);
  const payload = parseOrThrow(updateAdminSchema, request.body);
  const data = await usersService.updateAdmin(request.server, request.user.companyId, id, payload);
  return reply.send(data);
}

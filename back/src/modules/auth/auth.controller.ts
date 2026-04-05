import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import { customerLoginSchema, loginSchema, logoutSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(registerSchema, request.body);
  const result = await authService.register(request.server, payload);
  return reply.status(201).send(result);
}

export async function login(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(loginSchema, request.body);
  const result = await authService.login(request.server, payload);
  return reply.send(result);
}

export async function customerLogin(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(customerLoginSchema, request.body);
  const result = await authService.customerLogin(request.server, payload);
  return reply.send(result);
}

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(refreshSchema, request.body);
  const result = await authService.refreshSession(request.server, payload.refreshToken);
  return reply.send(result);
}

export async function logout(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(logoutSchema, request.body);
  const result = await authService.logout(request.server, payload.refreshToken);
  return reply.send(result);
}

export async function me(request: FastifyRequest, reply: FastifyReply) {
  const result = await authService.me(request.server, request.user.userId);
  return reply.send(result);
}

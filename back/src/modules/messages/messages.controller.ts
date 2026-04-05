import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import { createMessageSchema, ticketIdParamSchema } from './messages.schemas.js';
import * as messagesService from './messages.service.js';

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const { ticketId } = parseOrThrow(ticketIdParamSchema, request.params);
  const data = await messagesService.listMessages(request.server, request.user.companyId, ticketId);
  return reply.send(data);
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { ticketId } = parseOrThrow(ticketIdParamSchema, request.params);
  const payload = parseOrThrow(createMessageSchema, request.body);

  const data = await messagesService.createMessage(
    request.server,
    request.user.companyId,
    ticketId,
    request.user.userId,
    payload
  );

  return reply.status(201).send(data);
}

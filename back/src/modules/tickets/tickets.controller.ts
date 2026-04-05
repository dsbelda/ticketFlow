import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import {
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketSchema,
  updateTicketStatusSchema
} from './tickets.schemas.js';
import * as ticketsService from './tickets.service.js';

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const query = parseOrThrow(listTicketsQuerySchema, request.query);
  const result = await ticketsService.listTickets(request.server, request.user.companyId, query);
  return reply.send(result);
}

export async function getById(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(ticketIdParamSchema, request.params);
  const result = await ticketsService.getTicketById(request.server, request.user.companyId, id);
  return reply.send(result);
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(createTicketSchema, request.body);
  const result = await ticketsService.createTicket(request.server, request.user.companyId, payload);
  return reply.status(201).send(result);
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(ticketIdParamSchema, request.params);
  const payload = parseOrThrow(updateTicketSchema, request.body);
  const result = await ticketsService.updateTicket(request.server, request.user.companyId, id, payload);
  return reply.send(result);
}

export async function updateStatus(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(ticketIdParamSchema, request.params);
  const payload = parseOrThrow(updateTicketStatusSchema, request.body);
  const result = await ticketsService.updateTicketStatus(request.server, request.user.companyId, id, payload.status);
  return reply.send(result);
}

export async function remove(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(ticketIdParamSchema, request.params);
  const result = await ticketsService.deleteTicket(request.server, request.user.companyId, id);
  return reply.send(result);
}

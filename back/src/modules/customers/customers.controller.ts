import type { FastifyReply, FastifyRequest } from 'fastify';

import { parseOrThrow } from '../../common/validators/zod.js';
import { createCustomerSchema, customerIdParamSchema, updateCustomerSchema } from './customers.schemas.js';
import * as customersService from './customers.service.js';

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const customers = await customersService.listCustomers(request.server, request.user.companyId);
  return reply.send(customers);
}

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const payload = parseOrThrow(createCustomerSchema, request.body);
  const customer = await customersService.createCustomer(request.server, request.user.companyId, payload);
  return reply.status(201).send(customer);
}

export async function update(request: FastifyRequest, reply: FastifyReply) {
  const { id } = parseOrThrow(customerIdParamSchema, request.params);
  const payload = parseOrThrow(updateCustomerSchema, request.body);
  const customer = await customersService.updateCustomer(request.server, request.user.companyId, id, payload);
  return reply.send(customer);
}

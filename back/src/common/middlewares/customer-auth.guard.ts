import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApiError } from '../errors/api-error.js';

export async function customerAuthGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Missing customer access token');
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.server.jwt.verify(token)) as Record<string, unknown>;
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid customer access token');
  }

  if (payload.typ !== 'customer') {
    throw new ApiError(403, 'FORBIDDEN', 'Token is not a customer token');
  }

  const customerId = typeof payload.customerId === 'string' ? payload.customerId : null;
  const companyId = typeof payload.companyId === 'string' ? payload.companyId : null;
  const email = typeof payload.email === 'string' ? payload.email : null;

  if (!customerId || !companyId || !email) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid customer token payload');
  }

  request.customerAuth = {
    customerId,
    companyId,
    email
  };
}

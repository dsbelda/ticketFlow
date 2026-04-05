import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApiError } from '../errors/api-error.js';

export async function authGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or missing access token');
  }
}

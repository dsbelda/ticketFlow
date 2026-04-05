import type { UserRole } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

import { ApiError } from '../errors/api-error.js';

export function requireRoles(roles: UserRole[]) {
  return async (request: FastifyRequest): Promise<void> => {
    const role = request.user?.role;

    if (!role || !roles.includes(role)) {
      throw new ApiError(403, 'FORBIDDEN', 'Insufficient permissions');
    }
  };
}

import type { FastifyPluginAsync } from 'fastify';
import { UserRole } from '@prisma/client';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import { requireRoles } from '../../common/middlewares/role.guard.js';
import * as controller from './customers.controller.js';

const customersRoutes: FastifyPluginAsync = async (fastify) => {
  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

  fastify.get('/', { preHandler: [authGuard, requireRoles(adminRoles)] }, controller.list);
  fastify.post('/', { preHandler: [authGuard, requireRoles(adminRoles)] }, controller.create);
  fastify.patch('/:id', { preHandler: [authGuard, requireRoles(adminRoles)] }, controller.update);
};

export default customersRoutes;

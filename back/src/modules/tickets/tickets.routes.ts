import type { FastifyPluginAsync } from 'fastify';
import { UserRole } from '@prisma/client';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import { requireRoles } from '../../common/middlewares/role.guard.js';
import * as controller from './tickets.controller.js';

const ticketsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', authGuard);
  fastify.addHook('preHandler', requireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENT]));

  fastify.get('/', controller.list);
  fastify.get('/:id', controller.getById);
  fastify.post('/', controller.create);
  fastify.put('/:id', controller.update);
  fastify.patch('/:id/status', controller.updateStatus);
  fastify.delete('/:id', controller.remove);
};

export default ticketsRoutes;

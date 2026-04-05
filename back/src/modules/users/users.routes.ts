import type { FastifyPluginAsync } from 'fastify';
import { UserRole } from '@prisma/client';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import { requireRoles } from '../../common/middlewares/role.guard.js';
import * as controller from './users.controller.js';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/me', { preHandler: [authGuard] }, controller.me);
  fastify.patch('/me/profile', { preHandler: [authGuard] }, controller.updateMyProfile);
  fastify.patch('/me/password', { preHandler: [authGuard] }, controller.changeMyPassword);

  fastify.get('/admins', { preHandler: [authGuard, requireRoles([UserRole.SUPER_ADMIN])] }, controller.listAdmins);
  fastify.post('/admins', { preHandler: [authGuard, requireRoles([UserRole.SUPER_ADMIN])] }, controller.createAdmin);
  fastify.patch(
    '/admins/:id',
    { preHandler: [authGuard, requireRoles([UserRole.SUPER_ADMIN])] },
    controller.updateAdmin
  );
};

export default usersRoutes;

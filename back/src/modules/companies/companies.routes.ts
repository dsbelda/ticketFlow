import type { FastifyPluginAsync } from 'fastify';
import { UserRole } from '@prisma/client';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import { requireRoles } from '../../common/middlewares/role.guard.js';
import * as controller from './companies.controller.js';

const companiesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/current', { preHandler: [authGuard] }, controller.getCurrentCompany);

  fastify.patch(
    '/current/settings',
    { preHandler: [authGuard, requireRoles([UserRole.SUPER_ADMIN])] },
    controller.updateCurrentCompany
  );

  fastify.post(
    '/validate-db-connection',
    { preHandler: [authGuard, requireRoles([UserRole.SUPER_ADMIN])] },
    controller.validateDbConnection
  );
};

export default companiesRoutes;

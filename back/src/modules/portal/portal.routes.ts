import type { FastifyPluginAsync } from 'fastify';

import { customerAuthGuard } from '../../common/middlewares/customer-auth.guard.js';
import * as controller from './portal.controller.js';

const portalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/tickets', { preHandler: [customerAuthGuard] }, controller.createTicket);
  fastify.get('/tickets', { preHandler: [customerAuthGuard] }, controller.listTickets);
};

export default portalRoutes;

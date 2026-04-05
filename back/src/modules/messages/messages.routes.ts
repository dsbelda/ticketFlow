import type { FastifyPluginAsync } from 'fastify';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import * as controller from './messages.controller.js';

const messagesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(async (child) => {
    child.addHook('preHandler', authGuard);
    child.get('/', controller.list);
    child.post('/', controller.create);
  }, { prefix: '/tickets/:ticketId/messages' });
};

export default messagesRoutes;

import type { FastifyPluginAsync } from 'fastify';

import { authGuard } from '../../common/middlewares/auth.guard.js';
import * as controller from './auth.controller.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', controller.register);

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, controller.login);
  fastify.post('/customer/login', controller.customerLogin);

  fastify.post('/refresh', controller.refresh);
  fastify.post('/logout', controller.logout);
  fastify.get('/me', { preHandler: [authGuard] }, controller.me);
};

export default authRoutes;

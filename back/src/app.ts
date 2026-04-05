import Fastify from 'fastify';
import { ZodError } from 'zod';

import { env } from './config/env.js';
import { APP_NAME } from './config/constants.js';
import { ApiError } from './common/errors/api-error.js';
import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import securityPlugin from './plugins/security.js';
import healthRoutes from './modules/health/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import companiesRoutes from './modules/companies/companies.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import ticketsRoutes from './modules/tickets/tickets.routes.js';
import messagesRoutes from './modules/messages/messages.routes.js';
import setupRoutes from './modules/setup/setup.routes.js';
import portalRoutes from './modules/portal/portal.routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn'
    }
  });

  await app.register(prismaPlugin);
  await app.register(securityPlugin);
  await app.register(jwtPlugin);

  await app.register(healthRoutes);
  await app.register(setupRoutes, { prefix: '/setup' });
  await app.register(portalRoutes, { prefix: '/portal' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(usersRoutes, { prefix: '/users' });
  await app.register(companiesRoutes, { prefix: '/companies' });
  await app.register(customersRoutes, { prefix: '/customers' });
  await app.register(ticketsRoutes, { prefix: '/tickets' });
  await app.register(messagesRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
        details: error.details ?? null
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.flatten()
      });
    }

    const message = env.NODE_ENV === 'production' ? 'Internal server error' : error.message;
    app.log.error(error);

    return reply.status(500).send({
      error: 'INTERNAL_SERVER_ERROR',
      message
    });
  });

  app.get('/', async () => ({
    name: APP_NAME,
    status: 'ok'
  }));

  return app;
}

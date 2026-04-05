import fp from 'fastify-plugin';

import { env } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(import('@fastify/helmet'));

  await fastify.register(import('@fastify/cors'), {
    origin: env.CORS_ORIGIN,
    credentials: true
  });

  await fastify.register(import('@fastify/rate-limit'), {
    global: true,
    max: 120,
    timeWindow: '1 minute'
  });
});

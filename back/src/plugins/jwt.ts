import fp from 'fastify-plugin';

import { env } from '../config/env.js';

export default fp(async (fastify) => {
  await fastify.register(import('@fastify/jwt'), {
    secret: env.JWT_ACCESS_SECRET
  });
});

import type { FastifyPluginAsync } from 'fastify';

import * as controller from './setup.controller.js';

const setupRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/status', controller.status);
  fastify.post('/validate-db', controller.validateDatabase);
  fastify.post('/install', controller.install);
};

export default setupRoutes;

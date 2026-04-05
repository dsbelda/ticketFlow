import type { FastifyInstance } from 'fastify';

import { sha256 } from '../../common/utils/hash.js';

export async function createRefreshTokenRecord(
  app: FastifyInstance,
  userId: string,
  refreshToken: string,
  expiresAt: Date
) {
  return app.prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(refreshToken),
      expiresAt
    }
  });
}

export async function findValidRefreshToken(app: FastifyInstance, refreshToken: string) {
  const tokenHash = sha256(refreshToken);

  return app.prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() }
    }
  });
}

export async function revokeRefreshToken(app: FastifyInstance, refreshToken: string) {
  const tokenHash = sha256(refreshToken);

  await app.prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  });
}

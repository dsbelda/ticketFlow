import type { PrismaClient, UserRole } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }

  interface FastifyRequest {
    user: {
      userId: string;
      companyId: string;
      role: UserRole;
      email: string;
      iat?: number;
      exp?: number;
    };
    customerAuth?: {
      customerId: string;
      companyId: string;
      email: string;
    };
  }
}

export {};

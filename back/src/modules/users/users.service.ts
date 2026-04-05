import type { FastifyInstance } from 'fastify';
import { UserRole } from '@prisma/client';

import { ApiError } from '../../common/errors/api-error.js';
import { hashPassword, verifyPassword } from '../../common/utils/password.js';
import type {
  changeMyPasswordSchema,
  createAdminSchema,
  updateAdminSchema,
  updateMyProfileSchema
} from './users.schemas.js';

type UpdateMyProfileInput = import('zod').infer<typeof updateMyProfileSchema>;
type ChangeMyPasswordInput = import('zod').infer<typeof changeMyPasswordSchema>;
type CreateAdminInput = import('zod').infer<typeof createAdminSchema>;
type UpdateAdminInput = import('zod').infer<typeof updateAdminSchema>;

export async function me(app: FastifyInstance, userId: string) {
  return app.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      companyId: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateMyProfile(app: FastifyInstance, userId: string, payload: UpdateMyProfileInput) {
  return app.prisma.user.update({
    where: { id: userId },
    data: { name: payload.name },
    select: {
      id: true,
      companyId: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true
    }
  });
}

export async function changeMyPassword(app: FastifyInstance, userId: string, payload: ChangeMyPasswordInput) {
  const user = await app.prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const valid = await verifyPassword(payload.currentPassword, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Current password is invalid');
  }

  const newPasswordHash = await hashPassword(payload.newPassword);

  await app.prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  return { success: true };
}

export async function listAdmins(app: FastifyInstance, companyId: string) {
  return app.prisma.user.findMany({
    where: {
      companyId,
      role: {
        in: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createAdmin(app: FastifyInstance, companyId: string, payload: CreateAdminInput) {
  const existing = await app.prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'EMAIL_ALREADY_IN_USE', 'Email already in use');
  }

  const passwordHash = await hashPassword(payload.password);

  return app.prisma.user.create({
    data: {
      companyId,
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: UserRole.ADMIN
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateAdmin(
  app: FastifyInstance,
  companyId: string,
  adminId: string,
  payload: UpdateAdminInput
) {
  const admin = await app.prisma.user.findFirst({
    where: {
      id: adminId,
      companyId,
      role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] }
    }
  });

  if (!admin) {
    throw new ApiError(404, 'ADMIN_NOT_FOUND', 'Admin not found');
  }

  return app.prisma.user.update({
    where: { id: adminId },
    data: {
      name: payload.name,
      email: payload.email,
      isActive: payload.isActive
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

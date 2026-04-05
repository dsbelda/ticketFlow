import type { FastifyInstance } from 'fastify';
import { UserRole } from '@prisma/client';

import { ApiError } from '../../common/errors/api-error.js';
import { hashPassword, verifyPassword } from '../../common/utils/password.js';
import { generateRefreshTokenValue } from '../../common/utils/token.js';
import { env } from '../../config/env.js';
import {
  createRefreshTokenRecord,
  findValidRefreshToken,
  revokeRefreshToken
} from '../refresh-tokens/refresh-token.service.js';
import type { CustomerLoginInput, LoginInput, RegisterInput } from './auth.schemas.js';

type PublicUser = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

function parseDurationToDate(duration: string): Date {
  const match = duration.match(/^(\d+)([mhd])$/);
  if (!match) {
    throw new Error(`Unsupported duration format: ${duration}`);
  }

  const [, rawValue, unit] = match;
  const value = Number(rawValue);
  const msPerUnit = unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;

  return new Date(Date.now() + value * msPerUnit);
}

function mapUser(user: {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}): PublicUser {
  return {
    id: user.id,
    companyId: user.companyId,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  };
}

async function issueTokens(app: FastifyInstance, user: PublicUser) {
  const accessToken = await app.jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      email: user.email
    },
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      secret: env.JWT_ACCESS_SECRET
    }
  );

  const refreshNonce = generateRefreshTokenValue();
  const refreshToken = await app.jwt.sign(
    {
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
      nonce: refreshNonce,
      typ: 'refresh'
    },
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      secret: env.JWT_REFRESH_SECRET
    }
  );

  await createRefreshTokenRecord(app, user.id, refreshToken, parseDurationToDate(env.JWT_REFRESH_EXPIRES_IN));

  return {
    accessToken,
    refreshToken
  };
}

export async function register(app: FastifyInstance, payload: RegisterInput) {
  const existing = await app.prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(409, 'EMAIL_ALREADY_IN_USE', 'Email already in use');
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await app.prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { name: payload.companyName }
    });

    return tx.user.create({
      data: {
        companyId: company.id,
        name: payload.name,
        email: payload.email,
        passwordHash,
        role: UserRole.ADMIN
      }
    });
  });

  const publicUser = mapUser(user);
  const tokens = await issueTokens(app, publicUser);

  return {
    user: publicUser,
    ...tokens
  };
}

export async function login(app: FastifyInstance, payload: LoginInput) {
  const user = await app.prisma.user.findUnique({ where: { email: payload.email } });

  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const isValid = await verifyPassword(payload.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
  }

  const publicUser = mapUser(user);
  const tokens = await issueTokens(app, publicUser);

  return {
    user: publicUser,
    ...tokens
  };
}

export async function customerLogin(app: FastifyInstance, payload: CustomerLoginInput) {
  const customer = await app.prisma.customer.findFirst({
    where: {
      companyId: payload.companyId,
      email: payload.email,
      isActive: true
    }
  });

  if (!customer || !customer.passwordHash) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid customer credentials');
  }

  const isValid = await verifyPassword(payload.password, customer.passwordHash);
  if (!isValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid customer credentials');
  }

  const accessToken = await app.jwt.sign(
    {
      typ: 'customer',
      customerId: customer.id,
      companyId: customer.companyId,
      email: customer.email
    },
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      secret: env.JWT_ACCESS_SECRET
    }
  );

  return {
    accessToken,
    customer: {
      id: customer.id,
      companyId: customer.companyId,
      name: customer.name,
      email: customer.email
    }
  };
}

export async function refreshSession(app: FastifyInstance, refreshToken: string) {
  let decoded: { sub: string };

  try {
    decoded = (await app.jwt.verify(refreshToken, { secret: env.JWT_REFRESH_SECRET })) as { sub: string };
  } catch {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
  }

  const storedToken = await findValidRefreshToken(app, refreshToken);
  if (!storedToken) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
  }

  const user = await app.prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
  }

  await revokeRefreshToken(app, refreshToken);

  const publicUser = mapUser(user);
  const tokens = await issueTokens(app, publicUser);

  return {
    user: publicUser,
    ...tokens
  };
}

export async function logout(app: FastifyInstance, refreshToken: string) {
  await revokeRefreshToken(app, refreshToken);
  return { success: true };
}

export async function me(app: FastifyInstance, userId: string) {
  const user = await app.prisma.user.findUnique({
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

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  return user;
}

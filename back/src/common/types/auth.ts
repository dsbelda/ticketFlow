import type { UserRole } from '@prisma/client';

export type AuthUser = {
  userId: string;
  companyId: string;
  role: UserRole;
  email: string;
};

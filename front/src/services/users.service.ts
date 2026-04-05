import { api } from './api';

export type AdminUser = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  name: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
};

export type UpdateAdminInput = {
  name?: string;
  email?: string;
  isActive?: boolean;
};

export async function updateMyProfile(input: UpdateProfileInput) {
  const { data } = await api.patch('/users/me/profile', input);
  return data;
}

export async function changeMyPassword(input: ChangePasswordInput) {
  const { data } = await api.patch('/users/me/password', input);
  return data;
}

export async function listAdmins() {
  const { data } = await api.get<AdminUser[]>('/users/admins');
  return data;
}

export async function createAdmin(input: CreateAdminInput) {
  const { data } = await api.post<AdminUser>('/users/admins', input);
  return data;
}

export async function updateAdmin(id: string, input: UpdateAdminInput) {
  const { data } = await api.patch<AdminUser>(`/users/admins/${id}`, input);
  return data;
}

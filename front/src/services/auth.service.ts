import { api } from './api';
import type { AuthResponse, User } from '../types/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type CustomerLoginInput = {
  companyId: string;
  email: string;
  password: string;
};

export type CustomerLoginResponse = {
  accessToken: string;
  customer: {
    id: string;
    companyId: string;
    name: string;
    email: string;
  };
};

export type RegisterInput = {
  companyName: string;
  name: string;
  email: string;
  password: string;
};

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function customerLogin(input: CustomerLoginInput) {
  const { data } = await api.post<CustomerLoginResponse>('/auth/customer/login', input);
  return data;
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function me() {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function logout(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken });
}

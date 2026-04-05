import { api } from './api';
import type { Customer } from '../types/customer';

export type CreateCustomerInput = {
  name: string;
  email: string;
  password: string;
  isActive?: boolean;
};

export type UpdateCustomerInput = {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
};

export async function listCustomers() {
  const { data } = await api.get<Customer[]>('/customers');
  return data;
}

export async function createCustomer(input: CreateCustomerInput) {
  const { data } = await api.post<Customer>('/customers', input);
  return data;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  const { data } = await api.patch<Customer>(`/customers/${id}`, input);
  return data;
}

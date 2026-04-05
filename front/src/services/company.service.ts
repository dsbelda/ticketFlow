import { api } from './api';

export type UpdateCompanySettingsInput = {
  name: string;
  logoUrl?: string;
};

export type ValidateDbPayload = {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  mode: 'create' | 'existing';
};

export async function getCurrentCompany() {
  const { data } = await api.get('/companies/current');
  return data;
}

export async function updateCompanySettings(input: UpdateCompanySettingsInput) {
  const { data } = await api.patch('/companies/current/settings', input);
  return data;
}

export async function validateCompanyDbConnection(database: ValidateDbPayload) {
  const { data } = await api.post('/companies/validate-db-connection', { database });
  return data;
}

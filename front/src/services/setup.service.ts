import { api } from './api';
import type {
  SetupInstallPayload,
  SetupInstallResponse,
  SetupStatusResponse,
  ValidateDatabaseResponse
} from '../types/setup';

export async function getSetupStatus() {
  const { data } = await api.get<SetupStatusResponse>('/setup/status');
  return data;
}

export async function installSetup(payload: SetupInstallPayload) {
  const { data } = await api.post<SetupInstallResponse>('/setup/install', payload);
  return data;
}

export async function validateDatabase(payload: SetupInstallPayload['database']) {
  const { data } = await api.post<ValidateDatabaseResponse>('/setup/validate-db', { database: payload });
  return data;
}

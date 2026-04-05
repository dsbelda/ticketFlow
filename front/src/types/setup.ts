export type SetupInstallPayload = {
  companyName: string;
  companyLogoUrl?: string;
  adminEmail: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    mode: 'create' | 'existing';
  };
};

export type SetupStatusResponse = {
  configured: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
    createdAt: string;
  } | null;
};

export type SetupInstallResponse = {
  configured: true;
  runtimeDatabaseMatchesProvided: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  admin: {
    id: string;
    companyId: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT';
    isActive: boolean;
    createdAt: string;
  };
  generatedAdminPassword: string;
  notes: string[];
};

export type ValidateDatabaseResponse = {
  ok: boolean;
  databaseExists: boolean | null;
  canCreateOnInstall: boolean;
  message: string;
};

import type { FastifyInstance } from 'fastify';
import { PrismaClient, UserRole } from '@prisma/client';
import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { Client } from 'pg';

import { env } from '../../config/env.js';
import { ApiError } from '../../common/errors/api-error.js';
import { hashPassword } from '../../common/utils/password.js';
import type { InstallSetupInput, ValidateDatabaseInput } from './setup.schemas.js';

type DatabaseInput = InstallSetupInput['database'];
const execFileAsync = promisify(execFile);

function getTemplateDbUrl(): URL {
  let parsed: URL;
  try {
    parsed = new URL(env.DATABASE_URL);
  } catch {
    throw new ApiError(500, 'INVALID_ENV_DATABASE_URL', 'DATABASE_URL en back/.env no es válida');
  }

  return parsed;
}

function buildDatabaseUrl(db: DatabaseInput): string {
  const template = getTemplateDbUrl();
  const encodedUser = encodeURIComponent(db.user);
  const encodedPass = encodeURIComponent(db.password);
  const auth = encodedPass.length > 0 ? `${encodedUser}:${encodedPass}` : encodedUser;
  const encodedDb = encodeURIComponent(db.name);
  const schema = template.searchParams.get('schema') ?? 'public';
  const sslMode = template.searchParams.get('sslmode');
  const sslQuery = sslMode ? `&sslmode=${sslMode}` : '';

  return `postgresql://${auth}@${db.host}:${db.port}/${encodedDb}?schema=${schema}${sslQuery}`;
}

function assertSafeDatabaseName(dbName: string): void {
  const isSafe = /^[a-zA-Z0-9_]+$/.test(dbName);
  if (!isSafe) {
    throw new ApiError(400, 'INVALID_DATABASE_NAME', 'El nombre de base de datos solo acepta letras, números y _');
  }
}

function buildAdminConnection(db: DatabaseInput): string {
  const encodedUser = encodeURIComponent(db.user);
  const encodedPass = encodeURIComponent(db.password);
  const auth = encodedPass.length > 0 ? `${encodedUser}:${encodedPass}` : encodedUser;
  return `postgresql://${auth}@${db.host}:${db.port}/postgres`;
}

async function ensureDatabase(
  db: DatabaseInput,
  options?: { allowCreate?: boolean; skipExistenceCheckForCreate?: boolean }
): Promise<{ existed: boolean | null }> {
  assertSafeDatabaseName(db.name);
  const adminConnection = buildAdminConnection(db);

  const client = new Client({ connectionString: adminConnection });

  try {
    await client.connect();

    if (db.mode === 'create') {
      if (options?.skipExistenceCheckForCreate) {
        return { existed: null };
      }

      const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [db.name]);
      if (exists.rowCount === 0 && options?.allowCreate) {
        const safeDbName = db.name.replace(/\"/g, '""');
        await client.query(`CREATE DATABASE \"${safeDbName}\"`);
        return { existed: false };
      }
      return { existed: exists.rowCount > 0 };
    } else {
      const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [db.name]);
      if (exists.rowCount === 0) {
        throw new ApiError(400, 'DATABASE_NOT_FOUND', 'La base de datos indicada no existe');
      }
      return { existed: true };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const extra =
      db.mode === 'create'
        ? ' Verifica credenciales y permisos CREATE DATABASE, o usa modo existente.'
        : ' Verifica credenciales y que la base exista.';
    throw new ApiError(
      400,
      'DATABASE_PREPARE_FAILED',
      `No se pudo validar/preparar la base de datos con host, puerto y nombre proporcionados.${extra}`
    );
  } finally {
    await client.end().catch(() => undefined);
  }

  return { existed: null };
}

async function verifyDatabaseConnection(db: DatabaseInput): Promise<void> {
  const connectionString = buildDatabaseUrl(db);
  const client = new Client({ connectionString });

  try {
    await client.connect();
    await client.query('SELECT 1');
  } catch {
    throw new ApiError(
      400,
      'DATABASE_CONNECTION_FAILED',
      'No se pudo conectar con la base de datos usando la configuración proporcionada'
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function runPrismaCommand(databaseUrl: string, args: string[]): Promise<void> {
  try {
    await execFileAsync('npx', ['prisma', ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'unknown error';
    const stderr =
      typeof error === 'object' && error !== null && 'stderr' in error
        ? String((error as { stderr?: unknown }).stderr ?? '')
        : '';
    const details = stderr.trim().length > 0 ? ` | ${stderr.trim()}` : '';
    throw new ApiError(
      500,
      'PRISMA_COMMAND_FAILED',
      `Error ejecutando prisma ${args.join(' ')}: ${message}${details}`
    );
  }
}

async function userTableExists(db: DatabaseInput): Promise<boolean> {
  const connectionString = buildDatabaseUrl(db);
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const result = await client.query(`SELECT to_regclass('"public"."User"') AS table_name`);
    return Boolean(result.rows[0]?.table_name);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function prepareDatabaseSchema(db: DatabaseInput): Promise<void> {
  const databaseUrl = buildDatabaseUrl(db);
  await runPrismaCommand(databaseUrl, ['generate']);

  try {
    await runPrismaCommand(databaseUrl, ['migrate', 'deploy']);
  } catch {
    // Puede fallar si no hay migraciones o por estado parcial; seguimos con verificación.
  }

  const hasUserTable = await userTableExists(db);
  if (!hasUserTable) {
    await runPrismaCommand(databaseUrl, ['db', 'push', '--skip-generate']);
  }
}

function deriveAdminName(email: string): string {
  const local = email.split('@')[0] ?? 'admin';
  return local
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase()) || 'Administrador';
}

function generateTemporaryPassword(): string {
  return randomBytes(10).toString('base64url');
}

export async function getSetupStatus(app: FastifyInstance) {
  const usersCount = await app.prisma.user.count();
  const company = await app.prisma.company.findFirst({
    select: {
      id: true,
      name: true,
      logoUrl: true,
      createdAt: true
    }
  });

  return {
    configured: usersCount > 0,
    company: company ?? null
  };
}

export async function validateDatabaseConfig(_app: FastifyInstance, payload: ValidateDatabaseInput) {
  const dbResult = await ensureDatabase(payload.database, {
    allowCreate: false,
    skipExistenceCheckForCreate: payload.database.mode === 'create'
  });

  if (payload.database.mode === 'existing') {
    await verifyDatabaseConnection(payload.database);
  }

  return {
    ok: true,
    databaseExists: dbResult.existed,
    canCreateOnInstall: payload.database.mode === 'create',
    message:
      payload.database.mode === 'create'
        ? 'Conexión correcta con host/puerto/usuario. La base se creará al instalar si no existe.'
        : 'Conexión correcta.'
  };
}

export async function installSetup(_app: FastifyInstance, payload: InstallSetupInput) {
  await ensureDatabase(payload.database, { allowCreate: true });
  const providedDatabaseUrl = buildDatabaseUrl(payload.database);
  await verifyDatabaseConnection(payload.database);
  await prepareDatabaseSchema(payload.database);

  const setupPrisma = new PrismaClient({
    datasources: {
      db: {
        url: providedDatabaseUrl
      }
    }
  });

  const created = await (async () => {
    try {
      const existingUsers = await setupPrisma.user.count();
      if (existingUsers > 0) {
        throw new ApiError(409, 'SETUP_ALREADY_COMPLETED', 'La instalación inicial ya fue completada');
      }

      const existingAdminEmail = await setupPrisma.user.findUnique({
        where: { email: payload.adminEmail }
      });

      if (existingAdminEmail) {
        throw new ApiError(409, 'EMAIL_ALREADY_IN_USE', 'El correo del administrador ya existe');
      }

      const generatedAdminPassword = generateTemporaryPassword();
      const passwordHash = await hashPassword(generatedAdminPassword);

      try {
        return await setupPrisma.$transaction(async (tx) => {
          const company = await tx.company.create({
            data: {
              name: payload.companyName,
              logoUrl: payload.companyLogoUrl?.trim() ? payload.companyLogoUrl : null
            }
          });

          const admin = await tx.user.create({
            data: {
              companyId: company.id,
              name: deriveAdminName(payload.adminEmail),
              email: payload.adminEmail,
              passwordHash,
              role: UserRole.SUPER_ADMIN
            },
            select: {
              id: true,
              companyId: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true
            }
          });

          return {
            company,
            admin,
            generatedAdminPassword
          };
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error interno de base de datos';
        throw new ApiError(
          400,
          'DATABASE_WRITE_FAILED',
          `No se pudo escribir en la base de datos (Company/User). Revisa permisos del usuario PostgreSQL. Detalle: ${message}`
        );
      }
    } finally {
      await setupPrisma.$disconnect();
    }
  })();

  return {
    configured: true,
    runtimeDatabaseMatchesProvided: env.DATABASE_URL === providedDatabaseUrl,
    company: {
      id: created.company.id,
      name: created.company.name,
      logoUrl: created.company.logoUrl
    },
    admin: created.admin,
    generatedAdminPassword: created.generatedAdminPassword,
    notes: [
      'Guarda la contraseña temporal del administrador y cámbiala tras el primer login.',
      'Si runtimeDatabaseMatchesProvided es false, revisa DATABASE_URL en back/.env antes de arrancar en producción.'
    ]
  };
}

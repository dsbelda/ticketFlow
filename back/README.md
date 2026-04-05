# Gestion Tickets - Backend

Backend API para un SaaS multiempresa de gestión de tickets.

## Stack

- Node.js + TypeScript
- Fastify
- Prisma
- PostgreSQL
- JWT (access + refresh con rotación)
- Zod para validación

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Ajusta `DATABASE_URL` y secretos JWT en `.env`.

## 3. Generar cliente Prisma

```bash
npx prisma generate
# o
npm run prisma:generate
```

## 4. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
# o
npm run prisma:migrate -- --name init
```

## 5. Arrancar en desarrollo

```bash
npm run dev
```

## 6. Build y ejecución en producción

```bash
npm run build
npm run start
```

## Scripts disponibles

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`
- `npm run lint`

## Endpoints principales

- `GET /health`
- `GET /setup/status`
- `POST /setup/validate-db`
- `POST /setup/install`
- `PATCH /companies/current/settings` (SUPER_ADMIN)
- `POST /companies/validate-db-connection` (SUPER_ADMIN)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /tickets`
- `GET /tickets/:id`
- `POST /tickets`
- `PUT /tickets/:id`
- `PATCH /tickets/:id/status`
- `DELETE /tickets/:id`
- `GET /customers`
- `POST /customers`
- `GET /tickets/:ticketId/messages`
- `POST /tickets/:ticketId/messages`
- `POST /portal/tickets` (cliente)
- `GET /portal/tickets` (cliente)

## Notas

- `POST /setup/install` recibe host/puerto/nombre de DB + modo (`create` o `existing`), valida/prepara la base, ejecuta `prisma generate`, aplica esquema (`migrate deploy` y fallback `db push`) y crea empresa + admin inicial.
- El setup usa usuario/password enviados en el asistente para conectar a PostgreSQL.
- Después de añadir `logoUrl` en `Company`, ejecuta una nueva migración Prisma.
- `register` crea una `Company` y un primer usuario `ADMIN`.
- `DELETE /tickets/:id` usa borrado físico.
- Multiempresa aplicada por `companyId` del usuario autenticado.

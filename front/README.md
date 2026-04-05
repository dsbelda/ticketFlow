# Gestion Tickets - Frontend

Base de frontend con Vue 3 + TypeScript + Quasar + Pinia + Vue Router.

## 1. Instalar dependencias

```bash
npm install
```

## 2. Configurar entorno

```bash
cp .env.example .env
```

Variable principal:

- `VITE_API_URL=http://localhost:3000`

## 3. Arrancar en desarrollo

```bash
npm run dev
```

## 4. Build

```bash
npm run build
```

## Navegación incluida

- `/setup` (instalador inicial)
- `/portal` (clientes: crear/ver tickets)
- `/login`
- `/`
- `/tickets`
- `/tickets/:id`
- `/customers`
- `/superadmin` (solo SUPER_ADMIN)

## Notas

- En la primera ejecución se fuerza un instalador para configurar:
  - paso 1: PostgreSQL (host, puerto, usuario, contraseña, nombre de DB y si crear o usar existente)
  - paso 2: empresa (nombre/logo) + email de administrador
- Niveles de acceso:
  - `SUPER_ADMIN`: branding y validaciones de conexión
  - `ADMIN`/`AGENT`: operación de tickets internos
  - `Cliente`: portal público para crear tickets y revisar progreso
- En el paso 1 hay botón para validar conexión de base de datos antes de avanzar.
- El `setup` llama al backend para ejecutar tareas de Prisma automáticamente durante la instalación inicial.
- La configuración inicial se guarda en `localStorage` y se aplica automáticamente al layout.
- Tokens guardados en `localStorage` para esta base inicial.
- `api.ts` deja preparado el punto de extensión para refresh token automático.

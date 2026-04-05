<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-card class="gt-panel q-pa-md q-gutter-md">
        <div>
          <div class="text-h5 gt-title">SuperAdmin: Configuración</div>
          <div class="gt-subtitle">Configura branding, base de datos y administradores.</div>
        </div>

        <q-form class="q-gutter-sm gt-form" @submit.prevent="saveSettings">
          <q-input v-model="name" outlined label="Nombre de la app" />
          <q-input v-model="logoUrl" outlined label="Logo URL" />
          <q-btn color="primary" type="submit" :loading="saving" label="Guardar configuración" />
        </q-form>

        <q-separator />

        <div class="text-subtitle1 text-weight-bold">Validar conexión DB</div>
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-md-4"><q-input v-model="dbHost" outlined label="Host" /></div>
          <div class="col-12 col-md-2"><q-input v-model.number="dbPort" outlined type="number" label="Puerto" /></div>
          <div class="col-12 col-md-3"><q-input v-model="dbUser" outlined label="Usuario" /></div>
          <div class="col-12 col-md-3"><q-input v-model="dbPassword" outlined type="password" label="Contraseña" /></div>
          <div class="col-12 col-md-6"><q-input v-model="dbName" outlined label="Base" /></div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="dbMode"
              outlined
              label="Modo"
              :options="[
                { label: 'Crear si no existe', value: 'create' },
                { label: 'Usar existente', value: 'existing' }
              ]"
              option-label="label"
              option-value="value"
              emit-value
              map-options
            />
          </div>
        </div>

        <q-btn outline color="primary" :loading="validating" label="Validar conexión" @click="validateDb" />

        <q-separator />

        <q-form class="q-gutter-sm" @submit.prevent="handleCreateAdmin">
          <div class="text-subtitle1 text-weight-bold">Crear administrador</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4"><q-input v-model="adminName" outlined label="Nombre" /></div>
            <div class="col-12 col-md-4"><q-input v-model="adminEmail" outlined label="Email" /></div>
            <div class="col-12 col-md-4"><q-input v-model="adminPassword" outlined type="password" label="Contraseña" /></div>
          </div>
          <q-btn color="secondary" :loading="creatingAdmin" type="submit" label="Crear admin" />
        </q-form>

        <q-table :rows="admins" :columns="adminColumns" row-key="id" flat bordered>
          <template #body-cell-isActive="props">
            <q-td :props="props">
              <q-toggle :model-value="props.row.isActive" @update:model-value="toggleAdmin(props.row.id, $event as boolean)" />
            </q-td>
          </template>
        </q-table>

        <q-banner v-if="message" :class="ok ? 'bg-green-1 text-green-10' : 'bg-red-1 text-red-10'" class="rounded-borders">
          {{ message }}
        </q-banner>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

import { useAppConfigStore } from '../stores/app-config';
import {
  getCurrentCompany,
  updateCompanySettings,
  validateCompanyDbConnection
} from '../services/company.service';
import { createAdmin, listAdmins, updateAdmin, type AdminUser } from '../services/users.service';

const appConfig = useAppConfigStore();

const name = ref('');
const logoUrl = ref('');
const saving = ref(false);

const dbHost = ref('localhost');
const dbPort = ref(5432);
const dbUser = ref('');
const dbPassword = ref('');
const dbName = ref('');
const dbMode = ref<'create' | 'existing'>('existing');
const validating = ref(false);

const admins = ref<AdminUser[]>([]);
const creatingAdmin = ref(false);
const adminName = ref('');
const adminEmail = ref('');
const adminPassword = ref('');

const message = ref('');
const ok = ref(false);

const adminColumns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'role', label: 'Rol', field: 'role', align: 'left' as const },
  { name: 'isActive', label: 'Activo', field: 'isActive', align: 'left' as const }
];

onMounted(async () => {
  const company = await getCurrentCompany();
  name.value = company?.name ?? '';
  logoUrl.value = company?.logoUrl ?? '';
  appConfig.saveConfig(name.value || 'Gestión Tickets', logoUrl.value || '');
  await loadAdmins();
});

async function loadAdmins() {
  admins.value = await listAdmins();
}

async function saveSettings() {
  saving.value = true;
  try {
    const company = await updateCompanySettings({ name: name.value, logoUrl: logoUrl.value });
    appConfig.saveConfig(company.name, company.logoUrl ?? '');
    ok.value = true;
    message.value = 'Configuración guardada';
  } catch {
    ok.value = false;
    message.value = 'No se pudo guardar la configuración';
  } finally {
    saving.value = false;
  }
}

async function validateDb() {
  validating.value = true;
  message.value = '';

  try {
    const result = await validateCompanyDbConnection({
      host: dbHost.value,
      port: dbPort.value,
      user: dbUser.value,
      password: dbPassword.value,
      name: dbName.value,
      mode: dbMode.value
    });

    ok.value = true;
    message.value = result.message;
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'Error validando conexión';
    } else {
      message.value = 'Error validando conexión';
    }
  } finally {
    validating.value = false;
  }
}

async function handleCreateAdmin() {
  creatingAdmin.value = true;
  message.value = '';

  try {
    await createAdmin({
      name: adminName.value,
      email: adminEmail.value,
      password: adminPassword.value
    });

    adminName.value = '';
    adminEmail.value = '';
    adminPassword.value = '';
    ok.value = true;
    message.value = 'Administrador creado';
    await loadAdmins();
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'No se pudo crear el administrador';
    } else {
      message.value = 'No se pudo crear el administrador';
    }
  } finally {
    creatingAdmin.value = false;
  }
}

async function toggleAdmin(id: string, isActive: boolean) {
  try {
    await updateAdmin(id, { isActive });
    await loadAdmins();
  } catch {
    message.value = 'No se pudo actualizar el admin';
    ok.value = false;
  }
}
</script>

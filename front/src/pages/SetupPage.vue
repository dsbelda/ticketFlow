<template>
  <div class="row items-center justify-center q-pa-md" style="min-height: 100vh">
    <div class="gt-page-wrap" style="max-width: 860px">
      <q-card class="gt-panel">
        <q-card-section>
          <div class="text-h5 gt-title">Instalación inicial</div>
          <div class="gt-subtitle">Asistente de configuración paso a paso.</div>
        </q-card-section>

        <q-separator />

        <q-card-section v-if="installed" class="q-gutter-md gt-form">
          <div class="text-subtitle1 text-weight-bold">Instalación completada</div>
          <div class="gt-subtitle">
            Se creó la empresa y el usuario administrador. Guarda esta contraseña temporal:
          </div>

          <q-banner class="bg-blue-1 text-blue-10 rounded-borders">
            <div class="text-caption">Password temporal admin</div>
            <div class="text-weight-bold">{{ generatedAdminPassword }}</div>
          </q-banner>

          <q-btn color="primary" label="Ir al login" @click="goToLogin" />
        </q-card-section>

        <q-card-section v-else class="gt-form q-gutter-md">
          <div class="row items-center q-col-gutter-sm">
            <div class="col">
              <q-chip :color="step === 1 ? 'primary' : 'grey-4'" :text-color="step === 1 ? 'white' : 'dark'">
                Paso 1: Base de datos
              </q-chip>
              <q-chip :color="step === 2 ? 'primary' : 'grey-4'" :text-color="step === 2 ? 'white' : 'dark'">
                Paso 2: Empresa y admin
              </q-chip>
            </div>
          </div>

          <q-form v-if="step === 1" class="q-gutter-md" @submit.prevent="nextStep">
            <div class="text-subtitle1 text-weight-bold">Base de datos PostgreSQL</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input v-model="dbHost" label="Host" outlined required />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model.number="dbPort" type="number" label="Puerto" outlined required />
              </div>
              <div class="col-12 col-md-5">
                <q-input v-model="dbName" label="Nombre base de datos" outlined required />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="dbUser" label="Usuario PostgreSQL" outlined required />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="dbPassword" type="password" label="Contraseña PostgreSQL (opcional)" outlined />
              </div>
            </div>

            <q-option-group
              v-model="dbMode"
              type="radio"
              color="primary"
              :options="[
                { label: 'Crear base de datos si no existe', value: 'create' },
                { label: 'Usar base de datos existente', value: 'existing' }
              ]"
            />

            <q-banner v-if="dbValidationMessage" :class="dbValidationOk ? 'bg-green-1 text-green-10' : 'bg-red-1 text-red-10'" class="rounded-borders">
              {{ dbValidationMessage }}
            </q-banner>

            <div class="row justify-between">
              <q-btn
                outline
                color="primary"
                label="Validar conexión"
                :loading="dbValidating"
                @click="onValidateDatabase"
              />
              <q-btn color="primary" label="Siguiente" type="submit" />
            </div>
          </q-form>

          <q-form v-else class="q-gutter-md" @submit.prevent="onSubmit">
            <div class="text-subtitle1 text-weight-bold">Empresa y administrador</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="companyName" label="Nombre de empresa" outlined required maxlength="120" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="companyLogoUrl" label="URL del logo" outlined hint="Opcional" />
              </div>
            </div>

            <q-input v-model="adminEmail" type="email" label="Email del administrador" outlined required />

            <q-card flat bordered v-if="companyLogoUrl.trim()" class="q-pa-md">
              <div class="text-caption q-mb-sm">Vista previa del logo</div>
              <img
                :src="companyLogoUrl"
                alt="Logo empresa"
                style="max-height: 72px; max-width: 100%; object-fit: contain"
                @error="logoPreviewError = true"
                @load="logoPreviewError = false"
              />
              <div v-if="logoPreviewError" class="text-negative text-caption q-mt-sm">
                No se pudo cargar la imagen. Revisa la URL.
              </div>
            </q-card>

            <div v-if="error" class="text-negative text-caption">{{ error }}</div>

            <div class="row items-center justify-between">
              <q-btn flat color="primary" label="Volver" @click="step = 1" />
              <q-btn type="submit" color="primary" :loading="loading" label="Instalar" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

import { useAppConfigStore } from '../stores/app-config';
import { getSetupStatus, installSetup, validateDatabase } from '../services/setup.service';
import type { SetupInstallPayload } from '../types/setup';

const appConfig = useAppConfigStore();
const router = useRouter();

const step = ref<1 | 2>(1);
const loading = ref(false);
const dbValidating = ref(false);
const error = ref('');
const dbValidationOk = ref(false);
const dbValidationMessage = ref('');
const logoPreviewError = ref(false);
const installed = ref(false);
const generatedAdminPassword = ref('');

const dbHost = ref('localhost');
const dbPort = ref(5432);
const dbName = ref('gestion_tickets');
const dbUser = ref('postgres');
const dbPassword = ref('postgres');
const dbMode = ref<SetupInstallPayload['database']['mode']>('create');

const companyName = ref(appConfig.companyName);
const companyLogoUrl = ref(appConfig.companyLogoUrl);
const adminEmail = ref('admin@example.com');

function nextStep() {
  if (!dbHost.value.trim() || !dbName.value.trim() || !dbPort.value || !dbUser.value.trim()) {
    return;
  }
  if (!dbValidationOk.value) {
    dbValidationMessage.value = 'Primero valida la conexión de base de datos.';
    return;
  }
  step.value = 2;
}

async function onValidateDatabase() {
  dbValidating.value = true;
  dbValidationMessage.value = '';

  try {
    const response = await validateDatabase({
      host: dbHost.value.trim(),
      port: dbPort.value,
      user: dbUser.value.trim(),
      password: dbPassword.value,
      name: dbName.value.trim(),
      mode: dbMode.value
    });
    dbValidationOk.value = response.ok;
    dbValidationMessage.value = response.message;
  } catch (err: unknown) {
    dbValidationOk.value = false;
    if (axios.isAxiosError(err)) {
      dbValidationMessage.value = err.response?.data?.message ?? 'No se pudo validar la conexión.';
    } else {
      dbValidationMessage.value = 'No se pudo validar la conexión.';
    }
  } finally {
    dbValidating.value = false;
  }
}

async function onSubmit() {
  if (!companyName.value.trim() || !adminEmail.value.trim()) {
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await installSetup({
      companyName: companyName.value.trim(),
      companyLogoUrl: companyLogoUrl.value.trim(),
      adminEmail: adminEmail.value.trim(),
      database: {
        host: dbHost.value.trim(),
        port: dbPort.value,
        user: dbUser.value.trim(),
        password: dbPassword.value,
        name: dbName.value.trim(),
        mode: dbMode.value
      }
    });

    appConfig.saveConfig(companyName.value, companyLogoUrl.value);
    generatedAdminPassword.value = response.generatedAdminPassword;
    installed.value = true;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.message ?? 'Error instalando la aplicación';
    } else {
      error.value = err instanceof Error ? err.message : 'Error instalando la aplicación';
    }
  } finally {
    loading.value = false;
  }
}

async function goToLogin() {
  await router.push({ name: 'login' });
}

onMounted(async () => {
  try {
    const status = await getSetupStatus();
    if (status.configured) {
      appConfig.saveConfig(status.company?.name ?? 'Gestión Tickets', status.company?.logoUrl ?? '');
      await router.push({ name: 'login' });
    }
  } catch {
    // Si backend no está disponible aún, dejamos el formulario visible.
  }
});

watch([dbHost, dbPort, dbUser, dbPassword, dbName, dbMode], () => {
  dbValidationOk.value = false;
  dbValidationMessage.value = '';
});
</script>

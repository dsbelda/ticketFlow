<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="gt-topbar text-white">
      <q-toolbar class="q-py-xs">
        <q-toolbar-title class="row items-center no-wrap">
          <img
            v-if="appConfig.companyLogoUrl"
            :src="appConfig.companyLogoUrl"
            alt="Company logo"
            style="height: 30px; max-width: 120px; object-fit: contain; margin-right: 10px"
          />
          <span class="text-weight-bold">{{ appConfig.companyName }}</span>
        </q-toolbar-title>
        <q-btn flat dense label="Inicio" to="/" />
        <q-btn flat dense label="Tickets" to="/tickets" />
        <q-btn flat dense label="Clientes" to="/customers" />
        <q-btn flat dense label="Mi perfil" to="/profile" />
        <q-btn v-if="auth.isSuperAdmin" flat dense label="SuperAdmin" to="/superadmin" />
        <q-btn flat dense label="Portal Cliente" to="/portal" />
        <q-space />
        <q-btn flat dense label="Cerrar sesión" @click="handleLogout" />
      </q-toolbar>
    </q-header>

    <q-page-container class="q-pa-sm q-pa-md-md">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuthStore } from '../stores/auth';
import { useAppConfigStore } from '../stores/app-config';

const auth = useAuthStore();
const appConfig = useAppConfigStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  await router.push({ name: 'login' });
}

onMounted(() => {
  void auth.fetchMe();
});
</script>

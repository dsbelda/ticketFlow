<template>
  <div class="row items-center justify-center q-pa-md" style="min-height: 100vh">
    <div class="gt-page-wrap" style="max-width: 460px">
      <q-card class="gt-panel">
        <q-card-section>
          <div class="text-h5 gt-title">Bienvenido</div>
          <div class="gt-subtitle">
            Inicia sesión para acceder a tu panel de tickets.
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md gt-form">
            <q-input v-model="email" label="Email" type="email" outlined required />
            <q-input v-model="password" label="Password" type="password" outlined required />
            <q-btn type="submit" color="primary" label="Entrar" :loading="auth.loading" class="full-width" />
          </q-form>
          <div v-if="auth.error" class="text-negative q-mt-sm">{{ auth.error }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '../stores/auth';

const email = ref('admin@example.com');
const password = ref('password123');
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function onSubmit() {
  await auth.login(email.value, password.value);
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/tickets';
  await router.push(redirect);
}
</script>

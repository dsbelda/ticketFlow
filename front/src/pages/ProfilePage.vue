<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-card class="gt-panel q-pa-md q-gutter-md">
        <div>
          <div class="text-h5 gt-title">Mi perfil</div>
          <div class="gt-subtitle">Actualiza tu nombre y tu contraseña.</div>
        </div>

        <q-form class="q-gutter-sm" @submit.prevent="saveProfile">
          <q-input v-model="name" outlined label="Nombre" />
          <q-btn color="primary" type="submit" :loading="savingProfile" label="Guardar perfil" />
        </q-form>

        <q-separator />

        <q-form class="q-gutter-sm" @submit.prevent="savePassword">
          <q-input v-model="currentPassword" outlined type="password" label="Contraseña actual" />
          <q-input v-model="newPassword" outlined type="password" label="Nueva contraseña" />
          <q-btn color="secondary" type="submit" :loading="savingPassword" label="Cambiar contraseña" />
        </q-form>

        <q-banner v-if="message" :class="ok ? 'bg-green-1 text-green-10' : 'bg-red-1 text-red-10'" class="rounded-borders">
          {{ message }}
        </q-banner>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useAuthStore } from '../stores/auth';
import { changeMyPassword, updateMyProfile } from '../services/users.service';

const auth = useAuthStore();

const name = ref('');
const currentPassword = ref('');
const newPassword = ref('');

const savingProfile = ref(false);
const savingPassword = ref(false);
const ok = ref(false);
const message = ref('');

onMounted(() => {
  name.value = auth.user?.name ?? '';
});

async function saveProfile() {
  savingProfile.value = true;
  message.value = '';
  try {
    const data = await updateMyProfile({ name: name.value });
    auth.user = data;
    ok.value = true;
    message.value = 'Perfil actualizado';
  } catch {
    ok.value = false;
    message.value = 'No se pudo actualizar el perfil';
  } finally {
    savingProfile.value = false;
  }
}

async function savePassword() {
  savingPassword.value = true;
  message.value = '';
  try {
    await changeMyPassword({ currentPassword: currentPassword.value, newPassword: newPassword.value });
    currentPassword.value = '';
    newPassword.value = '';
    ok.value = true;
    message.value = 'Contraseña actualizada';
  } catch {
    ok.value = false;
    message.value = 'No se pudo cambiar la contraseña';
  } finally {
    savingPassword.value = false;
  }
}
</script>

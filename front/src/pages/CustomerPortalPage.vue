<template>
  <div class="q-pa-md" style="min-height: 100vh">
    <div class="gt-page-wrap" style="max-width: 920px">
      <q-card class="gt-panel q-pa-md q-gutter-md">
        <div>
          <div class="text-h5 gt-title">Portal Cliente</div>
          <div class="gt-subtitle">Inicia sesión como cliente para crear tickets y ver su progreso.</div>
        </div>

        <q-form v-if="!portalToken" class="q-gutter-sm gt-form" @submit.prevent="handleLogin">
          <div class="text-subtitle1 text-weight-bold">Acceso cliente</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4"><q-input v-model="companyId" outlined label="Company ID" /></div>
            <div class="col-12 col-md-4"><q-input v-model="email" outlined label="Email" /></div>
            <div class="col-12 col-md-4"><q-input v-model="password" outlined type="password" label="Contraseña" /></div>
          </div>
          <q-btn color="primary" :loading="loginLoading" type="submit" label="Entrar" />
        </q-form>

        <template v-else>
          <div class="row items-center justify-between">
            <div>
              <div class="text-subtitle1 text-weight-bold">{{ customerName }}</div>
              <div class="gt-subtitle">{{ customerEmail }}</div>
            </div>
            <q-btn outline color="negative" label="Cerrar sesión cliente" @click="logoutPortal" />
          </div>

          <q-form class="q-gutter-sm gt-form" @submit.prevent="createTicket">
            <div class="text-subtitle1 text-weight-bold">Crear ticket</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6"><q-input v-model="subject" outlined label="Asunto" /></div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="priority"
                  outlined
                  label="Prioridad"
                  :options="['LOW', 'MEDIUM', 'HIGH', 'URGENT']"
                />
              </div>
              <div class="col-12"><q-input v-model="description" outlined type="textarea" label="Descripción" /></div>
            </div>
            <q-btn color="primary" :loading="creating" type="submit" label="Enviar ticket" />
          </q-form>

          <q-separator />

          <div class="row items-center justify-between">
            <div class="text-subtitle1 text-weight-bold">Mis tickets</div>
            <q-btn outline color="primary" label="Recargar" :loading="loadingTickets" @click="loadTickets" />
          </div>

          <q-list bordered separator>
            <q-item v-for="ticket in tickets" :key="ticket.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ ticket.subject }}</q-item-label>
                <q-item-label caption>
                  Estado: {{ ticket.status }} | Prioridad: {{ ticket.priority }} | {{ formatDate(ticket.createdAt) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>

        <q-banner v-if="message" :class="ok ? 'bg-green-1 text-green-10' : 'bg-red-1 text-red-10'" class="rounded-borders">
          {{ message }}
        </q-banner>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { onMounted, ref } from 'vue';

import { customerLogin } from '../services/auth.service';
import {
  clearPortalToken,
  createPortalTicket,
  getPortalToken,
  listPortalTickets,
  setPortalToken
} from '../services/portal.service';

const portalToken = ref<string | null>(getPortalToken());

const companyId = ref('');
const email = ref('');
const password = ref('');
const customerName = ref('');
const customerEmail = ref('');

const subject = ref('');
const description = ref('');
const priority = ref<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

const loginLoading = ref(false);
const creating = ref(false);
const loadingTickets = ref(false);
const tickets = ref<Array<{ id: string; subject: string; status: string; priority: string; createdAt: string }>>([]);

const ok = ref(false);
const message = ref('');

onMounted(() => {
  const storedName = localStorage.getItem('gt_customer_name');
  const storedEmail = localStorage.getItem('gt_customer_email');
  customerName.value = storedName ?? '';
  customerEmail.value = storedEmail ?? '';

  if (portalToken.value) {
    void loadTickets();
  }
});

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

async function handleLogin() {
  loginLoading.value = true;
  message.value = '';

  try {
    const data = await customerLogin({
      companyId: companyId.value,
      email: email.value,
      password: password.value
    });

    setPortalToken(data.accessToken);
    portalToken.value = data.accessToken;
    customerName.value = data.customer.name;
    customerEmail.value = data.customer.email;
    localStorage.setItem('gt_customer_name', data.customer.name);
    localStorage.setItem('gt_customer_email', data.customer.email);

    ok.value = true;
    message.value = 'Sesión iniciada';
    await loadTickets();
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'No se pudo iniciar sesión';
    } else {
      message.value = 'No se pudo iniciar sesión';
    }
  } finally {
    loginLoading.value = false;
  }
}

function logoutPortal() {
  clearPortalToken();
  localStorage.removeItem('gt_customer_name');
  localStorage.removeItem('gt_customer_email');
  portalToken.value = null;
  tickets.value = [];
  customerName.value = '';
  customerEmail.value = '';
}

async function createTicket() {
  creating.value = true;
  message.value = '';

  try {
    await createPortalTicket({
      subject: subject.value,
      description: description.value,
      priority: priority.value
    });

    ok.value = true;
    message.value = 'Ticket enviado correctamente';
    subject.value = '';
    description.value = '';
    priority.value = 'MEDIUM';
    await loadTickets();
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'No se pudo crear el ticket';
    } else {
      message.value = 'No se pudo crear el ticket';
    }
  } finally {
    creating.value = false;
  }
}

async function loadTickets() {
  loadingTickets.value = true;
  try {
    const data = await listPortalTickets();
    tickets.value = data.items;
  } catch {
    tickets.value = [];
  } finally {
    loadingTickets.value = false;
  }
}
</script>

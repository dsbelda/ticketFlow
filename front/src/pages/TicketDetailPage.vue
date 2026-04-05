<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-btn flat icon="arrow_back" label="Volver" @click="goBack" class="q-mb-sm" />

      <q-card class="gt-panel q-pa-md">
        <div class="text-h5 gt-title q-mb-md">Detalle del ticket</div>

        <q-card v-if="ticket" flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">{{ ticket.subject }}</div>
            <div class="gt-subtitle">Estado: {{ ticket.status }} | Prioridad: {{ ticket.priority }}</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <div>{{ ticket.description }}</div>
          </q-card-section>
        </q-card>

        <div v-else class="gt-subtitle">Cargando ticket...</div>

        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold">Mensajes (base preparada)</div>
            <div class="gt-subtitle q-mt-xs">
              Esta vista está lista para conectar listado y creación de mensajes en siguientes iteraciones.
            </div>
          </q-card-section>
        </q-card>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { fetchTicketById } from '../services/tickets.service';
import type { Ticket } from '../types/ticket';

const route = useRoute();
const router = useRouter();
const ticket = ref<Ticket | null>(null);

async function loadTicket() {
  const ticketId = String(route.params.id);
  ticket.value = await fetchTicketById(ticketId);
}

function goBack() {
  void router.push({ name: 'tickets' });
}

onMounted(() => {
  void loadTicket();
});
</script>

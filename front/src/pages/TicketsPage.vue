<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-card class="gt-panel q-pa-md">
        <div class="row items-center q-col-gutter-sm q-mb-md">
          <div class="col">
            <div class="text-h5 gt-title">Tickets</div>
            <div class="gt-subtitle">Listado actualizado de incidencias.</div>
          </div>
          <div class="col-auto">
            <q-btn color="primary" label="Recargar" @click="reload" :loading="store.loading" />
          </div>
        </div>

        <q-table
          :rows="store.list"
          :columns="columns"
          row-key="id"
          :loading="store.loading"
          flat
          bordered
          separator="horizontal"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <TicketStatusBadge :status="props.row.status" />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat color="primary" label="Ver detalle" @click="goToDetail(props.row.id)" />
            </q-td>
          </template>
        </q-table>

        <div v-if="store.error" class="text-negative q-mt-sm">{{ store.error }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import TicketStatusBadge from '../components/TicketStatusBadge.vue';
import { useTicketsStore } from '../stores/tickets';

const store = useTicketsStore();
const router = useRouter();

const columns = [
  { name: 'subject', label: 'Asunto', field: 'subject', align: 'left' as const },
  { name: 'status', label: 'Estado', field: 'status', align: 'left' as const },
  { name: 'priority', label: 'Prioridad', field: 'priority', align: 'left' as const },
  {
    name: 'customer',
    label: 'Cliente',
    field: (row: { customer?: { name: string } }) => row.customer?.name ?? '-',
    align: 'left' as const
  },
  { name: 'createdAt', label: 'Fecha', field: 'createdAt', align: 'left' as const },
  { name: 'actions', label: 'Acciones', field: 'id', align: 'left' as const }
];

async function reload() {
  await store.fetchTickets();
}

function goToDetail(id: string) {
  void router.push({ name: 'ticket-detail', params: { id } });
}

onMounted(() => {
  void reload();
});
</script>

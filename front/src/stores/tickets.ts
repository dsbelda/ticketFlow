import { ref } from 'vue';
import { defineStore } from 'pinia';

import * as ticketsService from '../services/tickets.service';
import type { Ticket } from '../types/ticket';

export const useTicketsStore = defineStore('tickets', () => {
  const list = ref<Ticket[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTickets() {
    loading.value = true;
    error.value = null;

    try {
      const data = await ticketsService.fetchTickets({ page: page.value, limit: limit.value });
      list.value = data.items;
      total.value = data.meta.total;
    } catch {
      error.value = 'No se pudieron cargar los tickets';
    } finally {
      loading.value = false;
    }
  }

  return {
    list,
    total,
    page,
    limit,
    loading,
    error,
    fetchTickets
  };
});

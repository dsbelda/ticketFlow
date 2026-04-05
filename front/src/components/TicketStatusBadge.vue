<template>
  <q-badge :color="color" rounded>
    {{ status }}
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TicketStatus } from '../types/ticket';

const props = defineProps<{ status: TicketStatus }>();

const color = computed(() => {
  switch (props.status) {
    case 'OPEN':
      return 'primary';
    case 'IN_PROGRESS':
      return 'orange';
    case 'PENDING':
      return 'grey';
    case 'RESOLVED':
      return 'positive';
    case 'CLOSED':
      return 'dark';
    default:
      return 'primary';
  }
});
</script>

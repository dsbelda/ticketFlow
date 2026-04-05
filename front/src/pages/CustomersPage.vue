<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-card class="gt-panel q-pa-md q-gutter-md">
        <div class="row items-center justify-between">
          <div>
            <div class="text-h5 gt-title">Clientes</div>
            <div class="gt-subtitle">SUPER_ADMIN y ADMIN pueden crearlos y gestionarlos.</div>
          </div>
          <q-btn color="primary" label="Recargar" @click="loadCustomers" :loading="loading" />
        </div>

        <q-form class="q-gutter-sm" @submit.prevent="handleCreate">
          <div class="text-subtitle1 text-weight-bold">Crear cliente</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-md-4"><q-input v-model="createName" outlined label="Nombre" /></div>
            <div class="col-12 col-md-4"><q-input v-model="createEmail" outlined label="Email" /></div>
            <div class="col-12 col-md-4"><q-input v-model="createPassword" outlined type="password" label="Contraseña" /></div>
          </div>
          <q-btn color="secondary" type="submit" :loading="creating" label="Crear cliente" />
        </q-form>

        <q-table :rows="customers" :columns="columns" row-key="id" flat bordered>
          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn dense flat color="primary" icon="edit" @click="openEdit(props.row)" />
            </q-td>
          </template>
        </q-table>

        <q-dialog v-model="editOpen">
          <q-card style="min-width: 460px">
            <q-card-section>
              <div class="text-h6">Editar cliente</div>
            </q-card-section>
            <q-card-section class="q-gutter-sm">
              <q-input v-model="editName" outlined label="Nombre" />
              <q-input v-model="editEmail" outlined label="Email" />
              <q-input v-model="editPassword" outlined type="password" label="Nueva contraseña (opcional)" />
              <q-toggle v-model="editIsActive" label="Activo" />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Guardar" :loading="savingEdit" @click="saveEdit" />
            </q-card-actions>
          </q-card>
        </q-dialog>

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

import {
  createCustomer,
  listCustomers,
  updateCustomer,
  type UpdateCustomerInput
} from '../services/customers.service';
import type { Customer } from '../types/customer';

const columns = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  {
    name: 'isActive',
    label: 'Activo',
    field: (row: Customer) => (row.isActive ? 'Sí' : 'No'),
    align: 'left' as const
  },
  {
    name: 'createdAt',
    label: 'Alta',
    field: (row: Customer) => new Date(row.createdAt).toLocaleDateString(),
    align: 'left' as const
  },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const }
];

const customers = ref<Customer[]>([]);
const loading = ref(false);
const creating = ref(false);
const savingEdit = ref(false);

const createName = ref('');
const createEmail = ref('');
const createPassword = ref('');

const editOpen = ref(false);
const editingId = ref('');
const editName = ref('');
const editEmail = ref('');
const editPassword = ref('');
const editIsActive = ref(true);

const ok = ref(false);
const message = ref('');

async function loadCustomers() {
  loading.value = true;
  try {
    customers.value = await listCustomers();
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  creating.value = true;
  message.value = '';

  try {
    await createCustomer({
      name: createName.value,
      email: createEmail.value,
      password: createPassword.value,
      isActive: true
    });

    createName.value = '';
    createEmail.value = '';
    createPassword.value = '';
    ok.value = true;
    message.value = 'Cliente creado';
    await loadCustomers();
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'No se pudo crear el cliente';
    } else {
      message.value = 'No se pudo crear el cliente';
    }
  } finally {
    creating.value = false;
  }
}

function openEdit(customer: Customer) {
  editingId.value = customer.id;
  editName.value = customer.name;
  editEmail.value = customer.email;
  editPassword.value = '';
  editIsActive.value = customer.isActive;
  editOpen.value = true;
}

async function saveEdit() {
  if (!editingId.value) return;

  savingEdit.value = true;
  message.value = '';

  const payload: UpdateCustomerInput = {
    name: editName.value,
    email: editEmail.value,
    isActive: editIsActive.value
  };

  if (editPassword.value.trim()) {
    payload.password = editPassword.value;
  }

  try {
    await updateCustomer(editingId.value, payload);
    editOpen.value = false;
    ok.value = true;
    message.value = 'Cliente actualizado';
    await loadCustomers();
  } catch (error: unknown) {
    ok.value = false;
    if (axios.isAxiosError(error)) {
      message.value = error.response?.data?.message ?? 'No se pudo actualizar el cliente';
    } else {
      message.value = 'No se pudo actualizar el cliente';
    }
  } finally {
    savingEdit.value = false;
  }
}

onMounted(() => {
  void loadCustomers();
});
</script>

<template>
  <q-page>
    <div class="gt-page-wrap q-pa-md">
      <q-card class="gt-panel q-pa-lg">
        <div class="text-h4 gt-title q-mb-sm">Panel principal</div>
        <div class="gt-subtitle q-mb-lg">
          Acceso rápido a tickets y clientes de tu empresa.
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 text-weight-bold">Tickets</div>
              <div class="gt-subtitle q-mt-xs">Gestiona incidencias, estados y prioridades.</div>
              <q-btn color="primary" class="q-mt-md" label="Ir a tickets" to="/tickets" />
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle1 text-weight-bold">Clientes</div>
              <div class="gt-subtitle q-mt-xs">Consulta la cartera de clientes activos.</div>
              <q-btn outline color="primary" class="q-mt-md" label="Ir a clientes" to="/customers" />
            </q-card>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

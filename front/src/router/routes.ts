import type { RouteRecordRaw } from 'vue-router';

import MainLayout from '../layouts/MainLayout.vue';
import LoginPage from '../pages/LoginPage.vue';
import SetupPage from '../pages/SetupPage.vue';
import IndexPage from '../pages/IndexPage.vue';
import TicketsPage from '../pages/TicketsPage.vue';
import TicketDetailPage from '../pages/TicketDetailPage.vue';
import CustomersPage from '../pages/CustomersPage.vue';
import SuperAdminPage from '../pages/SuperAdminPage.vue';
import CustomerPortalPage from '../pages/CustomerPortalPage.vue';
import ProfilePage from '../pages/ProfilePage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/setup',
    name: 'setup',
    component: SetupPage,
    meta: { public: true }
  },
  {
    path: '/portal',
    name: 'portal',
    component: CustomerPortalPage,
    meta: { public: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { public: true }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', component: IndexPage },
      { path: 'tickets', name: 'tickets', component: TicketsPage },
      { path: 'tickets/:id', name: 'ticket-detail', component: TicketDetailPage, props: true },
      { path: 'customers', name: 'customers', component: CustomersPage },
      { path: 'profile', name: 'profile', component: ProfilePage },
      {
        path: 'superadmin',
        name: 'superadmin',
        component: SuperAdminPage,
        meta: { requiresAuth: true, roles: ['SUPER_ADMIN'] }
      }
    ]
  }
];

export default routes;

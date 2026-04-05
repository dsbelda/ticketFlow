import { createRouter, createWebHistory } from 'vue-router';

import routes from './routes';
import { useAuthStore } from '../stores/auth';
import { useAppConfigStore } from '../stores/app-config';

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const appConfig = useAppConfigStore();

  if (auth.accessToken && !auth.user) {
    await auth.fetchMe();
  }

  if (!appConfig.isConfigured && to.name !== 'setup') {
    return { name: 'setup' };
  }

  if (appConfig.isConfigured && to.name === 'setup') {
    if (auth.accessToken) {
      return { name: 'tickets' };
    }
    return { name: 'login' };
  }

  if (to.meta.requiresAuth && !auth.accessToken) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  const requiredRoles = to.meta.roles as Array<string> | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const currentRole = auth.user?.role;
    if (!currentRole || !requiredRoles.includes(currentRole)) {
      return { name: 'tickets' };
    }
  }

  if (to.name === 'login' && auth.accessToken) {
    return { name: 'tickets' };
  }

  return true;
});

export default router;

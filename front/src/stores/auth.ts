import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import * as authService from '../services/auth.service';
import {
  clearStoredTokens,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens
} from '../services/api';
import type { User } from '../types/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(getStoredAccessToken());
  const refreshToken = ref<string | null>(getStoredRefreshToken());
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value));
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN');

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;

    try {
      const data = await authService.login({ email, password });
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      user.value = data.user;
      setStoredTokens(data.accessToken, data.refreshToken);
    } catch {
      error.value = 'No se pudo iniciar sesión';
      throw new Error(error.value);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    if (!accessToken.value) {
      return;
    }

    try {
      user.value = await authService.me();
    } catch {
      await logout();
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await authService.logout(refreshToken.value);
      }
    } catch {
      // si falla backend, limpiamos estado local igualmente
    }

    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    clearStoredTokens();
  }

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
    fetchMe
  };
});

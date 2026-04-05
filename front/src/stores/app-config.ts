import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import type { AppConfig } from '../types/app-config';

const APP_CONFIG_KEY = 'gt_app_config';

function readStoredConfig(): AppConfig | null {
  const raw = localStorage.getItem(APP_CONFIG_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AppConfig;
  } catch {
    return null;
  }
}

function writeStoredConfig(config: AppConfig) {
  localStorage.setItem(APP_CONFIG_KEY, JSON.stringify(config));
}

export const useAppConfigStore = defineStore('app-config', () => {
  const config = ref<AppConfig | null>(readStoredConfig());

  const isConfigured = computed(() => Boolean(config.value));
  const companyName = computed(() => config.value?.companyName ?? 'Gestión Tickets');
  const companyLogoUrl = computed(() => config.value?.companyLogoUrl ?? '');

  function saveConfig(companyName: string, companyLogoUrl: string) {
    const normalized: AppConfig = {
      companyName: companyName.trim(),
      companyLogoUrl: companyLogoUrl.trim(),
      configuredAt: new Date().toISOString()
    };

    config.value = normalized;
    writeStoredConfig(normalized);
  }

  return {
    config,
    isConfigured,
    companyName,
    companyLogoUrl,
    saveConfig
  };
});

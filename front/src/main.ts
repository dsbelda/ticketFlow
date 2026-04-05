import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar } from 'quasar';
import 'quasar/dist/quasar.css';
import '@quasar/extras/material-icons/material-icons.css';

import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Quasar, {
  config: {
    brand: {
      primary: '#0f766e',
      secondary: '#0ea5e9',
      accent: '#f97316'
    }
  }
});

app.mount('#app');

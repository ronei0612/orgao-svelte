// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  base: './',

  // ⚠️ ESSA É A CHAVE DA CORREÇÃO:
  // Força o Svelte 5 a carregar o runtime do navegador (index-client.js) nos testes
  resolve: {
    conditions: mode === 'test' ? ['browser'] : []
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  }
}));
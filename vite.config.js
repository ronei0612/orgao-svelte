// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    svelte(),
    svelteTesting() // Plugin oficial para testes do Svelte 5
  ],
  base: './',

  // Aplica a resolução do 'browser' APENAS durante os testes do Vitest,
  // sem apagar a configuração nativa do navegador no "npm run dev"
  ...(mode === 'test' && {
    resolve: {
      conditions: ['browser']
    }
  }),

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  }
}));
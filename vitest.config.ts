import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['tests/vitest.setup.ts'],
    exclude: ['node_modules/**', '**/*.e2e.{ts,tsx}', '**/e2e/**', '**/playwright/**'],
    globals: true,
    alias: { '@/': new URL('./', import.meta.url).pathname },
  },
});

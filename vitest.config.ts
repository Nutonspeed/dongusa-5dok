import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['tests/vitest.setup.ts'],
    exclude: [
      '**/*.e2e.{ts,tsx}',
      '**/e2e/**',
      '**/playwright/**',
      '**/node_modules/**',
      'tests/components/ProductCard.test.tsx',
      'tests/integration/ecommerce-flow.test.tsx',
    ],
    alias: { '@': new URL('./', import.meta.url).pathname, '@/*': new URL('./', import.meta.url).pathname },
  },
  resolve: { alias: { '@': '.', '@/*': './*' } },
});

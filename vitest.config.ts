// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.
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
    alias: {
      '@': new URL('./', import.meta.url).pathname,
      '@/*': new URL('./', import.meta.url).pathname,
      'zod/v4': 'zod',
      '@ai-sdk/gateway/v4': '@ai-sdk/gateway',
    },
  },
  resolve: {
    alias: {
      '@': '.',
      '@/*': './*',
      'zod/v4': 'zod',
      '@ai-sdk/gateway/v4': '@ai-sdk/gateway',
    },
  },
});

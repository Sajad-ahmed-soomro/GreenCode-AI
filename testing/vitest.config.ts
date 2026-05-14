import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['testing/**/*.spec.ts'],
    environment: 'node',
    globals: true,
    teardown: true,
  },
});

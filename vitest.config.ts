import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      include: ['src/main'],
      reporter: ['text', 'html'],
      clean: true,
      thresholds: {
        '100': true,
      },
    },
  },
});

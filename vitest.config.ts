import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests-jest/**/*'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/utils/header.ts',
        'src/facilitators/mock.ts',
        'src/schemes/exact.ts',
        'src/types/x402.ts',
      ],
      all: true,
      thresholds: {
        lines: 100,
        statements: 100,
        branches: 100,
        functions: 100,
      },
    },
  },
});
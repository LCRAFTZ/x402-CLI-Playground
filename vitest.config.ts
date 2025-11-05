import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['node'],
  },
  test: {
    include: ['tests/**/*.vitest.test.ts', 'tests/**/*.test.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'cypress/**',
      '.git/**',
      '.idea/**',
      '.nyc_output/**',
      'tmp/**',
      'temp/**',
      'tests-jest/**/*',
    ],
    environment: 'node',
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
        lines: 85,
        statements: 85,
        branches: 70,
        functions: 100,
      },
    },
  },
});
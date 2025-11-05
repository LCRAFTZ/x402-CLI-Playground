/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests-jest'],
  collectCoverageFrom: ['src/utils/header.ts'],
  coverageReporters: ['text', 'json'],
  coverageThreshold: {
    global: { branches: 100, functions: 100, lines: 100, statements: 100 },
  },
};
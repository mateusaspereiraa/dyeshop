const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  // Ignore Playwright E2E skeleton tests during unit test runs
  testPathIgnorePatterns: ['<rootDir>/tests/playwright/'],
  collectCoverage: true,
  // Avoid instrumenting Next pages in coverage collection which can cause Babel config issues
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/index.ts', '!src/**/prisma.ts', '!src/pages/**']
}

module.exports = createJestConfig(customJestConfig)

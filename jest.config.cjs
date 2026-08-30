/**
 * The app source is ESM (Zapier only supports TypeScript integrations as ESM),
 * but the tests run through ts-jest's CommonJS output, so the `.js` specifiers
 * TypeScript requires have to be mapped back onto the `.ts` sources.
 */
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  clearMocks: true,
  testTimeout: 20000,
};

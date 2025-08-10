/** @type {import('jest').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  '^@ui$': '<rootDir>/packages/ui/index.ts',
  '^@ui/(.*)$': '<rootDir>/packages/ui/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*))'
  ],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/', '<rootDir>/tests/visual/'],
};



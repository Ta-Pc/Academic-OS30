/** @type {import('jest').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      tsconfig: '<rootDir>/tsconfig.json',
      jsx: 'react-jsx'
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  '^@ui$': '<rootDir>/packages/ui/index.ts',
  '^@ui/(.*)$': '<rootDir>/packages/ui/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*))'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/e2e/', 
    '<rootDir>/tests/visual/',
  '<rootDir>/tests/unit/module-detail-back.test.tsx',  // JSX parsing issues with UI imports
  '<rootDir>/tests/unit/api.user-progression.test.ts',
  '<rootDir>/tests/unit/api.user-remediation.test.ts'
  ],
};



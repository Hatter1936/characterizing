import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: 2,
  moduleNameMapper: {
    '^@characterizing/db$': '<rootDir>/../db/src/index.ts',
    '^puppeteer$': '<rootDir>/src/__mocks__/puppeeter.js',
  },
}


export default config
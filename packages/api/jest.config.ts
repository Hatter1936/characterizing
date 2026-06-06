import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@characterizing/db$': '<rootDir>/../db/src/index.ts',
  },
}

export default config
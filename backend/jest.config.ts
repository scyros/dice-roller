/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  transform: {
    "^.+\\.ts?$": ["esbuild-jest", { sourcemap: true }],
  },
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ["**/*.ts", "!jest.config.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    "./db": {
      branches: 95,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testMatch: ["**/tests/*.test.ts"],
};

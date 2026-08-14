/**
 * Non-browser executable specifications. These drive the backend's pure decision
 * modules directly — SM-2 scheduling, quiz-session assembly, reminder timing,
 * upcoming-review grouping — none of which need a deployed stack to be exercised.
 *
 * They live in `unit/`, not `specs/`, because Playwright's default testMatch would
 * otherwise claim any `*.spec.ts` under its own testDir.
 *
 * Plain CommonJS rather than TypeScript: Jest can only read a `jest.config.ts` if
 * `ts-node` is installed, which nothing else here needs. The specs themselves are
 * still TypeScript, compiled by ts-jest against tsconfig.jest.json.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.unit.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};

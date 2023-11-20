export default {
  testEnvironment: 'node',
  testRegex: 'test\\/.*\\.ts$',
  coverageDirectory: 'coverage',
  collectCoverage: true,
  coverageReporters: ['lcov', 'text', 'text-summary', 'cobertura'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports', outputName: 'nodejs_junit.xml' }]],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  }
};

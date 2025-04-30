/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/_tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/_tests/_mocks/fileMock.js',
    '^../../services/youtubeService$': '<rootDir>/src/_tests/_mocks/youtubeService.ts',
    '^../../services/redditService$': '<rootDir>/src/_tests/_mocks/redditService.ts',
    '^../../utils/indexeddb$': '<rootDir>/src/_tests/_mocks/indexeddb.ts'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.app.json',
      useESM: true,
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@mantine|@tabler|dayjs)/)'
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}; 
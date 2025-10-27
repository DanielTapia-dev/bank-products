import type { Config } from 'jest';

const preset: Config = {
  preset: 'jest-preset-angular',
  testEnvironment: 'jsdom',
  globalSetup: 'jest-preset-angular/global-setup',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/?(*.)+(spec).ts'],
  moduleFileExtensions: ['ts', 'html', 'js'],
  transform: { '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular' },
  moduleNameMapper: { '\\.(css|scss|sass|less)$': 'identity-obj-proxy' },
};

export default preset;

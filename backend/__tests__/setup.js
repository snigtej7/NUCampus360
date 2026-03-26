// Test setup and utilities
const { jest } = require('@jest/globals');

// Mock Anthropic API
jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      messages: {
        create: jest.fn()
      }
    }))
  };
});

// Suppress console logs during tests (optional)
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Keep console.error for debugging failed tests
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

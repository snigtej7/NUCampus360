import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/__tests__/**',
        'src/main.jsx',
        'node_modules/'
      ],
      all: true,
      lines: 60,
      functions: 60,
      branches: 50,
      statements: 60
    },
    include: ['src/**/*.test.{js,jsx}'],
    testTimeout: 15000,
    testEnvironmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});

import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'vitest/config';

config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '*.config.*',
        '**/*.d.ts',
        '**/*.type.ts',
        '**/types/**',
        'src/mdx/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(
        __dirname,
        './src/test/__mocks__/server-only.ts',
      ),
    },
  },
});

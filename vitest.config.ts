import react from '@vitejs/plugin-react';
import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'vitest/config';

config({ path: '.env.test' });

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
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
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

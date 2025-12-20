import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import pluginImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  globalIgnores([
    '**/generated/**',
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '**/node_modules/**',
  ]),
  nextConfig,
  nextCoreWebVitals,
  nextTypescript,
  {
    plugins: {
      'simple-import-sort': pluginImportSort,
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': 'warn',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [['^\\u0000', '^@?\\w', '^[^.]', '^\\.']],
        },
      ],
      'simple-import-sort/exports': 'error',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
]);

export default eslintConfig;

// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  {
    files: ['agents/**/*.ts', 'approval-gate/**/*.ts', 'content-gate/**/*.ts', 'db/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    // web/ es su propio proyecto Next.js con su propio eslint.config.mjs (y su propia
    // copia de eslint-plugin-react) - lintarlo desde aca choca de version. Se lintea
    // por separado con `npm run lint` dentro de web/.
    ignores: ['dist/**', 'node_modules/**', 'orchestrator/n8n/**', 'web/**'],
  },
  eslintConfigPrettier,
);

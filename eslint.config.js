import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', '.bigbang/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-alert': 'error', // FE-02: dialogs come from the design kit
      'no-console': ['error', { allow: ['error', 'warn'] }],
    },
  },
  {
    files: ['src/web/**'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
);

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const noHtmlInjection = 'Never inject HTML. Use textContent / createElement (saves and imports are hostile input).';

export default defineConfig(
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**', 'node_modules/**'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: "AssignmentExpression[left.property.name=/^(innerHTML|outerHTML)$/]", message: noHtmlInjection },
        { selector: "CallExpression[callee.property.name='insertAdjacentHTML']", message: noHtmlInjection },
        { selector: "CallExpression[callee.property.name='write'][callee.object.name='document']", message: noHtmlInjection },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },
);

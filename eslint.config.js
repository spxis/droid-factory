import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import eslintPluginImport from 'eslint-plugin-import'
import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname })

export default tseslint.config(
  // Bring in legacy-style shareable configs via the compatibility layer
  ...compat.config({
    extends: [
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
    ],
  }),
  { ignores: ['dist', 'postcss.config.js', 'vite.config.ts', 'tailwind.config.js', 'eslint.config.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  settings: { react: { version: 'detect' } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      react,
      'jsx-a11y': jsxA11y,
      import: eslintPluginImport,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
  curly: ['error', 'all'],
  'import/first': 'error',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
  'import/newline-after-import': ['warn', { count: 1 }],
      'import/no-unresolved': 'off',
  'import/named': 'off',
  'react/prop-types': 'off',
  'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    indent: ['error', 2, { SwitchCase: 1 }],
  },
},
)

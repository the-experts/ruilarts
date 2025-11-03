import tseslint from 'typescript-eslint'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-plugin-prettier/recommended'
import testingLibrary from 'eslint-plugin-testing-library'
import vitest from '@vitest/eslint-plugin'

export default tseslint.config(
    {
      files: ['**/*.{ts,tsx}'],
      ignores: ['.react-router/**/*'],
      extends: [
        // js
        js.configs.recommended,
        // ts
        tseslint.configs.stylistic,
        tseslint.configs.strictTypeChecked,
        // react
        react.configs.flat.recommended,
        // import
        importPlugin.flatConfigs.recommended,
        // a11y (accessibility
        jsxA11y.flatConfigs.strict,
        // prettier
        prettier,
      ],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
      plugins: {
        'react-hooks': reactHooks,
      },
      settings: {
        react: {
          version: 'detect',
        },
        'import/resolver': {
          typescript: {
            project: './tsconfig.json',
          },
        },
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        ...react.configs['jsx-runtime'].rules,
        'no-console': 'error',
        curly: 'error',
        'react/prop-types': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        'no-unused-vars': 'off',
        'import/no-named-as-default-member': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/only-throw-error': [
          'error',
        ],
        'import/newline-after-import': ['error', { count: 1 }],
        'import/order': [
          'error',
          {
            groups: [
              'builtin', // Built-in imports (come from NodeJS native) go first
              'external', // <- External imports
              'internal', // <- Absolute imports
              ['sibling', 'parent'], // <- Relative imports, the sibling and parent types they can be mingled together
              'index', // <- index imports
              'unknown', // <- unknown
            ],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
      },
    },
    {
      files: ['**/*.{spec,test}.{ts,tsx}'],
      extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        prettier,
      ],
      plugins: { 'testing-library': testingLibrary, vitest },
      rules: {
        'testing-library/await-async-queries': 'error',
        'testing-library/no-await-sync-queries': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-dom-import': 'off',
        ...vitest.configs.recommended.rules,
        'vitest/max-nested-describe': ['error', { max: 3 }],
        'vitest/valid-title': [
          'error',
          {
            allowArguments: true,
          },
        ],
      },
    }
  )

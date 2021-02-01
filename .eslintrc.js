const alias = require('./importAliases');

const unusedVarsIgnorePattern = '^_[0-9]+$';

module.exports = {
  settings: {
    'import/resolver': {
      'babel-module': {
        extensions: ['.js'],
        alias
      }
    }
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true
  },
  root: true,
  plugins: ['jest', 'module-resolver'],
  extends: [
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:import/errors',
    'plugin:import/warnings'
  ],
  globals: {
    Atomics: 'readonly'
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-case-declarations': 0,
    'no-return-await': 'error',
    'import/no-unresolved': 0,
    'import/order': [
      'error',
      {
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    curly: ['error', 'multi-or-nest', 'consistent'],
    'linebreak-style': ['error', 'unix'],
    'no-duplicate-imports': [
      'error',
      {
        includeExports: true
      }
    ],
    'rest-spread-spacing': ['error', 'never'],
    // 'no-inline-comments': [
    //   'error',
    //   {
    //     ignorePattern: '_prettier-hack'
    //   }
    // ],
    'prefer-spread': ['error'],
    'prefer-const': 'error',
    'no-useless-call': ['error'],
    'no-trailing-spaces': ['error'],
    'space-before-blocks': ['error', 'always'],
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: unusedVarsIgnorePattern,
        argsIgnorePattern: unusedVarsIgnorePattern,
        caughtErrorsIgnorePattern: unusedVarsIgnorePattern
      }
    ],
    'no-floating-decimal': ['error'],
    'comma-dangle': ['error', 'never'],
    'array-bracket-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'switch-colon-spacing': [
      'error',
      {
        after: true,
        before: false
      }
    ],
    'space-unary-ops': [
      'error',
      {
        words: true,
        nonwords: false
      }
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always'
      }
    ],
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true
      }
    ],
    'space-in-parens': ['error', 'never'],
    'block-spacing': 'error',
    'key-spacing': [
      'error',
      {
        singleLine: {
          beforeColon: false,
          afterColon: true,
          mode: 'strict'
        },
        multiLine: {
          beforeColon: false,
          afterColon: true,
          mode: 'strict'
        }
      }
    ],
    'generator-star-spacing': [
      'error',
      {
        before: false,
        after: true
      }
    ],
    eqeqeq: 'error',
    'no-empty': 'error',
    'no-debugger':
      process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-console':
      process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-alert':
      process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
};

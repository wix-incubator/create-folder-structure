module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    es6: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'json', 'prettier'],
  extends: ['eslint:recommended', 'plugin:json/recommended', 'prettier'],
  globals: {},
  rules: {
    'require-atomic-updates': 'off',
    'no-console': 'off',
    'prettier/prettier': 'error',
    'no-unused-vars': 'off', // it is the same as @typescript-eslint/no-unused-vars which is on
    'jest/no-disabled-tests': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          2,
          {
            args: 'none',
          },
        ],
      },
    },
  ],
}

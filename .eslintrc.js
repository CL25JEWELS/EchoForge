module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-undef': 'off', // TypeScript handles this
    'no-unused-vars': 'off', // Using @typescript-eslint/no-unused-vars instead
  },
  env: {
    es6: true,
    node: true,
  },
};

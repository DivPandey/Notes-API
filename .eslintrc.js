module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_|next' }],
        'no-console': 'warn',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'indent': ['error', 2],
        'comma-dangle': ['error', 'never'],
        'no-trailing-spaces': 'error',
        'eol-last': ['error', 'always']
    }
};

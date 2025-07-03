import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
    // Global ignores (dist, node_modules, etc.)
    {
        ignores: [
            'dist',
            'node_modules',
            'coverage',
            'build',
            'eslint.config.mjs',
            'jest.config.js',
        ],
    },

    // TypeScript and ESLint recommended config
    ...tseslint.config(
        eslint.configs.recommended,
        tseslint.configs.recommendedTypeChecked,
        {
            languageOptions: {
                parserOptions: {
                    projectService: true,
                    tsconfigRootDir: import.meta.dirname,
                },
            },
            // Optionally:
            rules: {
                //   'no-console': 'error',
                '@typescript-eslint/no-misused-promises': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
            },
        },
    ),
];

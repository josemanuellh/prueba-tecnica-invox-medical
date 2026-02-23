import eslint from '@eslint/js';
import tslint from 'typescript-eslint';

export default tslint.config(
    eslint.configs.recommended,
    ...tslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    }
);

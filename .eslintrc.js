module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    env: {
        node: true,
        mocha: true,
        es6: true
    },
    parserOptions: {
        project: ['./tsconfig.json'],
        createDefaultProgram: true
    },
    plugins: [
        '@typescript-eslint',
        'no-only-tests'
    ],
    extends: [
        'eslint:all',
        'plugin:@typescript-eslint/all'
    ],
    rules: {
        '@typescript-eslint/array-type': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/init-declarations': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/method-signature-style': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/no-base-to-string': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-extra-parens': 'off',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-implicit-any-catch': 'off',
        '@typescript-eslint/no-invalid-this': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        //possibly disable this once we have converted all throw statements to actual errors
        '@typescript-eslint/no-throw-literal': 'off',
        '@typescript-eslint/no-invalid-void': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-type-alias': 'off',
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars-experimental': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                'allowTemplateLiterals': true
            }
        ],
        '@typescript-eslint/require-array-sort-compare': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/sort-type-union-intersection-members': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/typedef': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/unified-signatures': 'off',
        'array-bracket-newline': 'off',
        'array-element-newline': 'off',
        'array-type': 'off',
        'arrow-body-style': 'off',
        'arrow-parens': 'off',
        'callback-return': 'off',
        'capitalized-comments': 'off',
        'class-methods-use-this': 'off',
        'complexity': 'off',
        'consistent-return': 'off',
        'consistent-this': 'off',
        'curly': 'error',
        'default-case': 'off',
        'dot-location': 'off',
        'dot-notation': 'off',
        'func-style': 'off',
        'function-call-argument-newline': 'off',
        'function-paren-newline': 'off',
        'getter-return': 'off',
        'guard-for-in': 'off',
        'id-length': 'off',
        'indent': 'off',
        'init-declarations': 'off',
        'line-comment-position': 'off',
        'linebreak-style': 'off',
        'lines-around-comment': 'off',
        'lines-between-class-members': 'off',
        'max-classes-per-file': 'off',
        'max-depth': 'off',
        'max-len': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
        'max-params': 'off',
        'max-statements': 'off',
        'no-only-tests/no-only-tests': 'error',
        'multiline-comment-style': 'off',
        'multiline-ternary': 'off',
        'new-cap': 'off',
        'newline-per-chained-call': 'off',
        'no-await-in-loop': 'off',
        'no-case-declarations': 'off',
        'no-constant-condition': 'off',
        'no-console': 'off',
        'no-continue': 'off',
        'no-else-return': 'off',
        'no-empty': 'off',
        'no-implicit-coercion': 'off',
        'no-inline-comments': 'off',
        'no-invalid-this': 'off',
        'no-labels': 'off',
        'no-lonely-if': 'off',
        'no-negated-condition': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-process-exit': 'off',
        'no-prototype-builtins': 'off',
        'no-shadow': 'off',
        'no-sync': 'off',
        'no-ternary': 'off',
        'no-undefined': 'off',
        'no-underscore-dangle': 'off',
        'no-unneeded-ternary': 'off',
        'no-useless-escape': 'off',
        'no-void': 'off',
        'no-warning-comments': 'off',
        'object-curly-spacing': 'off',
        'object-property-newline': 'off',
        'object-shorthand': 'off',
        'one-var': [
            'error',
            'never'
        ],
        'padded-blocks': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'prefer-named-capture-group': 'off',
        'prefer-template': 'off',
        'quote-props': 'off',
        'radix': 'off',
        'require-atomic-updates': 'off',
        'require-unicode-regexp': 'off',
        'sort-imports': 'off',
        'sort-keys': 'off',
        'spaced-comment': 'off',
        'vars-on-top': 'off',
        'wrap-regex': 'off'
    },
    //disable some rules for certain files
    overrides: [{
        files: ['*.spec.ts', 'benchmarks/**/*'],
        rules: {
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars-experimental': 'off',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/prefer-includes': 'off',
            '@typescript-eslint/prefer-regexp-exec': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/prefer-for-of': 'off',
            'func-names': 'off',
            'github/array-foreach': 'off',
            'new-cap': 'off',
            'no-new': 'off',
            'no-shadow': 'off',
            'prefer-arrow-callback': 'off'
        }
    }]
};

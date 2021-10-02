module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
    },
    plugins: ["react", "@typescript-eslint"],
    settings: {
        react: {
            version: "detect",
        },
    },
    rules: {
        "@typescript-eslint/ban-ts-comment": 0,
        "curly": "error",
        "quotes": ["error", "double"],
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-extra-semi": 0,
        "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
}

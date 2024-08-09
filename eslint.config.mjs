// import js from "@eslint/js";

export default [
    // js.configs.recommended,
    {
        ignores: [
            "test/**",
            "cases/**",
            "coverage/**",
            "prevtests/**",
            "node_modules/**",
            "temp/**",
        ],
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
        },
        rules: {
            indent: "off",
            quotes: ["error", "double", { avoidEscape: true }],
            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            "space-in-parens": "off",
            "no-console": "off",
            "eol-last": "error",
        },
    },
];

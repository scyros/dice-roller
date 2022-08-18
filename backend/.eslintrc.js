module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["tsconfig.eslint.json"],
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "no-unused-vars": "off",
    "prettier/prettier": "error",

    "@typescript-eslint/no-base-to-string": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  },
};

// .eslintrc.js
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["unused-imports"],
  rules: {
    "react/no-unescaped-entities": "off",         // ปิด ' ใน JSX
    "@next/next/no-img-element": "off",
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": ["warn", { vars: "all", varsIgnorePattern: "^_", argsIgnorePattern: "^_" }],
  },
  overrides: [
    { files: ["app/api/**/route.ts","scripts/**/*.ts"], rules: { "no-console": "off" } },
  ],
  ignorePatterns: ["mobile-app/**","coverage/**","scan/**"],
}

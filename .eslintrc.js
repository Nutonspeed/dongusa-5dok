// .eslintrc.js
module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["unused-imports"],
  rules: {
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": ["warn", { "vars": "all", "varsIgnorePattern": "^_", "argsIgnorePattern": "^_" }],
    "@next/next/no-img-element": "off"
  },
  overrides: [
    { files: ["app/api/**/route.ts"], rules: { "no-console": "off" } },
    { files: ["scripts/**/*.ts"], rules: { "no-console": "off" } }
  ],
  ignorePatterns: ["mobile-app/**", "coverage/**", "scan/**"]
}

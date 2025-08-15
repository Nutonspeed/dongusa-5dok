// DO NOT remove or restructure UI; data wiring only
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/*.e2e.{ts,tsx}", "**/e2e/**", "**/playwright/**"],
  },
});

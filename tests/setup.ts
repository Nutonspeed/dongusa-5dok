import { beforeAll, afterAll, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Setup test environment
beforeAll(() => {
  // Mock environment variables for testing
  process.env.NEXT_PUBLIC_USE_SUPABASE = "false";
  process.env.NEXT_PUBLIC_DEMO_MODE = "true";
  process.env.NODE_ENV = "test";
  process.env.QA_BYPASS_AUTH = '1';
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Cleanup after all tests
});

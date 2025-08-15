// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

import { validatePasswordStrength } from "./password-strength";

export const securityService = {
  validatePasswordStrength,
} as const;

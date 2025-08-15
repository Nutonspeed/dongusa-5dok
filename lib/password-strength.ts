// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

export function validatePasswordStrength(
  password: string,
): {
  score: number;
  feedback: string[];
  isValid: boolean;
  strength: "very_weak" | "weak" | "fair" | "good" | "strong";
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push("Password must be at least 8 characters long");

  if (password.length >= 12) score += 1;
  else feedback.push("Consider using 12+ characters for better security");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Include special characters");

  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push("Avoid repeating characters");

  const commonPasswords = ["password", "123456", "qwerty", "admin", "letmein"];
  if (!commonPasswords.some((common) => password.toLowerCase().includes(common))) score += 1;
  else feedback.push("Avoid common passwords");

  if (!/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password))
    score += 1;
  else feedback.push("Avoid sequential characters");

  if (!/password|qwerty|123456|letmein/i.test(password)) score += 1;

  const isValid = score >= 7;
  let strength: "very_weak" | "weak" | "fair" | "good" | "strong";
  if (score >= 9) strength = "strong";
  else if (score >= 7) strength = "good";
  else if (score >= 5) strength = "fair";
  else if (score >= 3) strength = "weak";
  else strength = "very_weak";

  return { score, feedback, isValid, strength };
}

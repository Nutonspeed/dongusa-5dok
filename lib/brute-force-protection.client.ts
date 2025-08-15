// NOTE: Boundary fix only. Do NOT restructure or remove existing UI.

export const bruteForceProtection = {
  async checkLoginAttempt(
    identifier: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
  ) {
    const res = await fetch("/api/security/brute-force", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check", identifier, ipAddress, userAgent, success }),
    });
    return res.json();
  },
  async getAccountStatus(email: string) {
    const res = await fetch("/api/security/brute-force", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", email }),
    });
    return res.json();
  },
} as const;


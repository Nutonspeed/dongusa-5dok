export async function fetchWithTimeout(input: RequestInfo, init: RequestInit & { timeoutMs?: number } = {}) {
  const { timeoutMs, ...rest } = init as any;
  const controller = new AbortController();
  const id = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    if (id) clearTimeout(id as any);
  }
}

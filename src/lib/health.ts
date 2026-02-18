export interface HealthCheckResult {
  isOnline: boolean;
  httpStatus: number | null;
  responseTimeMs: number | null;
}

export async function checkHealth(url: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
      });
    }

    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    return {
      isOnline: response.ok,
      httpStatus: response.status,
      responseTimeMs,
    };
  } catch {
    return {
      isOnline: false,
      httpStatus: null,
      responseTimeMs: null,
    };
  }
}

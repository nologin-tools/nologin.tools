export interface HealthCheckResult {
  isOnline: boolean;
  httpStatus: number | null;
  responseTimeMs: number | null;
}

function isSelfReference(url: string, siteUrl: string): boolean {
  try {
    return new URL(url).hostname === new URL(siteUrl).hostname;
  } catch {
    return false;
  }
}

export async function checkHealth(url: string, siteUrl?: string): Promise<HealthCheckResult> {
  // Self-referencing requests on Cloudflare Workers cause 522 errors.
  // If the target hostname matches SITE_URL, short-circuit: the Worker being
  // able to execute this code already proves the site is online.
  if (siteUrl && isSelfReference(url, siteUrl)) {
    return { isOnline: true, httpStatus: 200, responseTimeMs: 0 };
  }

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

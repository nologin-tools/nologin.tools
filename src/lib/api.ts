function success<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ ok: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(
  message: string,
  status = 400,
  details?: Record<string, string>
): Response {
  return new Response(JSON.stringify({ ok: false, error: message, details }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const api = { success, error };

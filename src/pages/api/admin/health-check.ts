import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, healthChecks } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { checkHealth } from '../../../lib/health';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret, toolId } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (!toolId || typeof toolId !== 'number') {
    return api.error('toolId is required.', 400);
  }

  // Fetch tool
  const [tool] = await db
    .select({ id: tools.id, url: tools.url })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  // Run health check
  const result = await checkHealth(tool.url);
  const now = new Date();

  // Store result
  await db.insert(healthChecks).values({
    toolId: tool.id,
    checkedAt: now,
    isOnline: result.isOnline,
    httpStatus: result.httpStatus,
    responseTimeMs: result.responseTimeMs,
  });

  return api.success({
    toolId: tool.id,
    isOnline: result.isOnline,
    httpStatus: result.httpStatus,
    responseTimeMs: result.responseTimeMs,
    checkedAt: now.toISOString(),
  });
};

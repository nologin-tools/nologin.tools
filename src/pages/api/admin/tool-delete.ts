import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../../lib/api';

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

  // Verify tool exists
  const [tool] = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  // Delete tool (cascade will clean up tags, health_checks, badge_displays, edit_suggestions)
  await db.delete(tools).where(eq(tools.id, toolId));

  return api.success({ toolId, deleted: true });
};

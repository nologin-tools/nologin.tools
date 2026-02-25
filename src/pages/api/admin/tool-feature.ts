export const prerender = false;

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

  const { secret, toolId, featured } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (!toolId) return api.error('toolId is required.', 400);
  if (typeof featured !== 'boolean') return api.error('featured must be a boolean.', 400);

  // Verify tool exists and is approved
  const [tool] = await db
    .select({ id: tools.id, status: tools.status })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) return api.error('Tool not found.', 404);
  if (tool.status !== 'approved') {
    return api.error('Only approved tools can be featured.', 400);
  }

  await db
    .update(tools)
    .set({
      isFeatured: featured,
      featuredAt: featured ? new Date() : null,
    })
    .where(eq(tools.id, toolId));

  return api.success({ toolId, featured });
};

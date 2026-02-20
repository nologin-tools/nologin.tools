import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { dataExports } from '../../../db/schema';
import { desc } from 'drizzle-orm';
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

  const { secret } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  const exports = await db
    .select()
    .from(dataExports)
    .orderBy(desc(dataExports.exportedAt))
    .limit(20);

  return api.success({ exports });
};

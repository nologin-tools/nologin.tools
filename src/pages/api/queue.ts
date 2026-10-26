export const prerender = false;

import type { APIRoute } from 'astro';
import { eq, or, like } from 'drizzle-orm';
import { getDb } from '../../db';
import { tools } from '../../db/schema';
import { api } from '../../lib/api';
import { fetchReviewQueueSnapshot, extractHostname } from '../../lib/queue';

export const GET: APIRoute = async ({ url, locals }) => {
  const d1 = locals.runtime?.env?.DB;
  const limitParam = parseInt(url.searchParams.get('limit') || '15', 10);
  const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(50, limitParam)) : 15;
  const query = (url.searchParams.get('q') || url.searchParams.get('slug') || '').trim();

  try {
    const snapshot = await fetchReviewQueueSnapshot(d1, {
      limit,
      lookupQuery: query || null,
    });

    let resolvedTool: { slug: string; name: string; status: string } | null = null;
    if (query && !snapshot.lookup && d1) {
      const db = getDb(d1);
      let cleanQ = query.toLowerCase();
      if (cleanQ.startsWith('http://') || cleanQ.startsWith('https://')) {
        cleanQ = extractHostname(cleanQ);
      }
      cleanQ = cleanQ.replace(/^www\./, '');
      const [found] = await db
        .select({
          slug: tools.slug,
          name: tools.name,
          status: tools.status,
        })
        .from(tools)
        .where(
          or(
            eq(tools.slug, cleanQ),
            like(tools.url, `%${cleanQ}%`),
            like(tools.name, `%${cleanQ}%`)
          )
        )
        .limit(1);
      if (found) {
        resolvedTool = found;
      }
    }

    return api.success({
      ...snapshot,
      resolvedTool,
    });
  } catch (err) {
    console.error('[api/queue] error:', err);
    return api.error('Failed to load review queue.', 500);
  }
};

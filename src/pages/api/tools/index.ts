import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { api } from '../../../lib/api';

export const GET: APIRoute = async ({ locals, url }) => {
  const db = getDb(locals.runtime.env.DB);

  const query = url.searchParams.get('q') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const perPage = 24;

  let results = await db
    .select({
      id: tools.id,
      slug: tools.slug,
      name: tools.name,
      url: tools.url,
      description: tools.description,
      coreTask: tools.coreTask,
      status: tools.status,
      approvedAt: tools.approvedAt,
    })
    .from(tools)
    .where(eq(tools.status, 'approved'));

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  const total = results.length;
  const paged = results.slice((page - 1) * perPage, page * perPage);

  // Fetch tags for paged results
  const toolIds = paged.map((t) => t.id);
  let toolTags: { toolId: number; tagKey: string; tagValue: string }[] = [];
  if (toolIds.length > 0) {
    toolTags = await db
      .select({
        toolId: tags.toolId,
        tagKey: tags.tagKey,
        tagValue: tags.tagValue,
      })
      .from(tags)
      .where(sql`${tags.toolId} IN (${sql.raw(toolIds.join(','))})`);
  }

  const tagMap = new Map<number, { key: string; value: string }[]>();
  for (const tag of toolTags) {
    if (!tagMap.has(tag.toolId)) tagMap.set(tag.toolId, []);
    tagMap.get(tag.toolId)!.push({ key: tag.tagKey, value: tag.tagValue });
  }

  return api.success({
    tools: paged.map((t) => ({
      ...t,
      tags: tagMap.get(t.id) || [],
    })),
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
};

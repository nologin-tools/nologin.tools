import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags, healthChecks } from '../../../db/schema';
import { eq, desc, like, or, sql } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { HEALTH_TOLERANCE, resolveEffectiveStatus } from '../../../lib/health';

const PAGE_SIZE = 20;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret, status, search, page = 1, featured } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  // Build conditions
  const conditions = [];
  if (status && status !== 'all') {
    conditions.push(eq(tools.status, status));
  }
  if (featured === true) {
    conditions.push(eq(tools.isFeatured, true));
  }
  if (search && typeof search === 'string' && search.trim()) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        like(tools.name, term),
        like(tools.url, term),
        like(tools.slug, term),
        like(tools.description, term)
      )!
    );
  }

  // Count total
  const where = conditions.length > 0
    ? sql`${sql.join(conditions.map(c => sql`(${c})`), sql` AND `)}`
    : undefined;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(tools)
    .where(where);
  const total = countResult[0].count;

  // Fetch tools
  const offset = (Math.max(1, Number(page)) - 1) * PAGE_SIZE;
  const toolList = await db
    .select()
    .from(tools)
    .where(where)
    .orderBy(desc(tools.submittedAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // Fetch tags and latest health for each tool
  const result = await Promise.all(
    toolList.map(async (tool) => {
      const toolTags = await db
        .select({ tagKey: tags.tagKey, tagValue: tags.tagValue })
        .from(tags)
        .where(eq(tags.toolId, tool.id));

      const recentChecks = await db
        .select({
          isOnline: healthChecks.isOnline,
          httpStatus: healthChecks.httpStatus,
          responseTimeMs: healthChecks.responseTimeMs,
          checkedAt: healthChecks.checkedAt,
        })
        .from(healthChecks)
        .where(eq(healthChecks.toolId, tool.id))
        .orderBy(desc(healthChecks.checkedAt))
        .limit(HEALTH_TOLERANCE);

      const latestHealth = recentChecks[0] || null;
      const effectiveStatus = resolveEffectiveStatus(recentChecks);

      return {
        ...tool,
        tags: toolTags,
        latestHealth: latestHealth
          ? { ...latestHealth, isOnline: effectiveStatus ?? latestHealth.isOnline }
          : null,
      };
    })
  );

  return api.success({
    tools: result,
    total,
    page: Number(page),
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
};

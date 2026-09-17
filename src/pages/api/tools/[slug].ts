export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags, healthChecks } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { HEALTH_TOLERANCE, resolveEffectiveStatus } from '../../../lib/health';
import { getToolEditorial } from '../../../data/loader';
import type { Locale } from '../../../i18n/config';

export const GET: APIRoute = async ({ params, locals, url }) => {
  const db = getDb(locals.runtime.env.DB);
  const { slug } = params;

  const [tool] = await db
    .select()
    .from(tools)
    .where(eq(tools.slug, slug!))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  const toolTags = await db
    .select({ key: tags.tagKey, value: tags.tagValue })
    .from(tags)
    .where(eq(tags.toolId, tool.id));

  const recentChecks = await db
    .select({
      isOnline: healthChecks.isOnline,
      checkedAt: healthChecks.checkedAt,
      httpStatus: healthChecks.httpStatus,
      responseTimeMs: healthChecks.responseTimeMs,
    })
    .from(healthChecks)
    .where(eq(healthChecks.toolId, tool.id))
    .orderBy(desc(healthChecks.checkedAt))
    .limit(HEALTH_TOLERANCE);

  const latestHealth = recentChecks[0] || null;
  const effectiveStatus = resolveEffectiveStatus(recentChecks);

  const langParam = (url.searchParams.get('lang') || 'en') as Locale;
  const editorial = getToolEditorial(tool.slug, langParam);

  return api.success({
    ...tool,
    tags: toolTags,
    latestHealth: latestHealth
      ? { ...latestHealth, isOnline: effectiveStatus ?? latestHealth.isOnline }
      : null,
    editorial: editorial
      ? {
          bestFor: editorial.bestFor || null,
          pros: editorial.pros || [],
          cons: editorial.cons || [],
          privacyVerdict: editorial.privacyVerdict || null,
          alternativeTo: editorial.alternativeTo || [],
          productScore: editorial.productScore || null,
          verdictTier: editorial.verdictTier || null,
          benchmarkNotes: editorial.benchmarkNotes || null,
          testedAt: editorial.testedAt || null,
          dueDiligence: editorial.dueDiligence || null,
        }
      : null,
  });
};

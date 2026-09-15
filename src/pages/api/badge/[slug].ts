export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, badgeDisplays } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateDynamicBadgeSvg, type BadgeStyle } from '../../../lib/badge';
import { getToolBySlug } from '../../../data/loader';

export const GET: APIRoute = async ({ params, url, locals }) => {
  const rawSlug = params.slug || '';
  const slug = rawSlug.replace(/\.svg$/, '');
  const style = (url.searchParams.get('style') as BadgeStyle) || 'flat';

  let tool: { name: string; status: string; id?: number } | null = null;
  let badgeDisplayType: string | null = null;

  // 1. Attempt lookup in Cloudflare D1
  if (locals.runtime?.env?.DB) {
    try {
      const db = getDb(locals.runtime.env.DB);
      const [dbTool] = await db
        .select({ id: tools.id, name: tools.name, status: tools.status })
        .from(tools)
        .where(eq(tools.slug, slug))
        .limit(1);

      if (dbTool) {
        tool = dbTool;
        const [badgeRow] = await db
          .select({ displayType: badgeDisplays.displayType })
          .from(badgeDisplays)
          .where(eq(badgeDisplays.toolId, dbTool.id))
          .limit(1);
        if (badgeRow) {
          badgeDisplayType = badgeRow.displayType;
        }
      }
    } catch {
      // Fallback to static data snapshot if D1 fails
    }
  }

  // 2. Fallback to build data snapshot if not found in D1
  if (!tool) {
    const staticTool = getToolBySlug(slug);
    if (staticTool) {
      tool = { name: staticTool.name, status: staticTool.status };
      badgeDisplayType = staticTool.badgeDisplayType;
    }
  }

  let badgeStatus: 'active' | 'verified' | 'pending' | 'not_found' = 'not_found';
  if (tool) {
    if (tool.status === 'approved') {
      badgeStatus = badgeDisplayType === 'explicit' ? 'active' : 'verified';
    } else if (tool.status === 'pending') {
      badgeStatus = 'pending';
    }
  }

  const svg = generateDynamicBadgeSvg({
    status: badgeStatus,
    style,
    title: tool ? `${tool.name} — Verified by NoLoginTools.org` : 'Verified by NoLoginTools.org',
  });

  return new Response(svg, {
    status: tool ? 200 : 404,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
};

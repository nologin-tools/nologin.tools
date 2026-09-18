export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../../db';
import { tools, badgeDisplays } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { generateDynamicBadgeSvg, type BadgeStyle } from '../../../../lib/badge';
import { getToolBySlug, getToolEditorial } from '../../../../data/loader';
import { computePrivacyScorecard } from '../../../../lib/privacy-scorecard.mjs';

export const GET: APIRoute = async ({ params, url, locals }) => {
  const rawSlug = params.slug || '';
  const slug = rawSlug.replace(/\.svg$/, '');
  const rawVariant = (params.variant || '').replace(/\.svg$/, '');
  const style = (url.searchParams.get('style') as BadgeStyle) || 'flat';

  let badgeType: 'verified' | 'grade' | 'sandbox' = 'verified';
  if (rawVariant === 'grade') {
    badgeType = 'grade';
  } else if (rawVariant === 'sandbox') {
    badgeType = 'sandbox';
  }

  let tool: { name: string; status: string; id?: number; tags?: any[]; repoUrl?: string | null; githubLicense?: string | null; githubStars?: number | null } | null = null;
  let badgeDisplayType: string | null = null;
  let staticTool = getToolBySlug(slug);

  // 1. Attempt lookup in Cloudflare D1
  if (locals.runtime?.env?.DB) {
    try {
      const db = getDb(locals.runtime.env.DB);
      const [dbTool] = await db
        .select({ id: tools.id, name: tools.name, status: tools.status, repoUrl: tools.repoUrl, githubLicense: tools.githubLicense, githubStars: tools.githubStars })
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
  if (!tool && staticTool) {
    tool = {
      name: staticTool.name,
      status: staticTool.status,
      repoUrl: staticTool.repoUrl,
      githubLicense: staticTool.githubLicense,
      githubStars: staticTool.githubStars,
      tags: staticTool.tags,
    };
    badgeDisplayType = staticTool.badgeDisplayType;
  }

  let badgeStatus: 'active' | 'verified' | 'pending' | 'not_found' = 'not_found';
  if (tool) {
    if (tool.status === 'approved') {
      badgeStatus = badgeDisplayType === 'explicit' ? 'active' : 'verified';
    } else if (tool.status === 'pending') {
      badgeStatus = 'pending';
    }
  }

  const toolForScorecard = staticTool || tool;
  const editorial = slug ? getToolEditorial(slug) : null;
  const scorecard = toolForScorecard ? computePrivacyScorecard(toolForScorecard, undefined, editorial) : null;

  const svg = generateDynamicBadgeSvg({
    status: badgeStatus,
    badgeType,
    grade: scorecard?.overallGrade,
    sandboxStatus: scorecard?.dimensions.sandbox.status,
    style,
    title: tool
      ? badgeType === 'grade'
        ? `${tool.name} — Privacy Grade ${scorecard?.overallGrade} by NoLoginTools.org`
        : badgeType === 'sandbox'
        ? `${tool.name} — ${scorecard?.dimensions.sandbox.status} by NoLoginTools.org`
        : `${tool.name} — Verified by NoLoginTools.org`
      : 'Verified by NoLoginTools.org',
  });

  return new Response(svg, {
    status: tool ? 200 : 404,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
};

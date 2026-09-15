export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, badgeDisplays } from '../../../db/schema';
import { eq, sql } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { parseGitHubRepoUrl } from '../../../lib/github';

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
    .select({
      id: tools.id,
      url: tools.url,
      repoUrl: tools.repoUrl,
      status: tools.status,
    })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  let displayType: 'explicit' | 'implicit' | 'none' = 'none';

  // 1. Check primary website URL
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(tool.url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'NoLoginTools-BadgeChecker/1.0',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();

      if (
        html.includes('nologin.tools/badge.svg') ||
        html.includes('nologin.tools/badge/') ||
        html.includes('nologin.tools/badges/') ||
        html.includes('nologintools.org/badge') ||
        html.includes('nologintools.org/badges')
      ) {
        displayType = 'explicit';
      } else if (
        html.includes('nologin-verified') ||
        html.includes('nologin.tools') ||
        html.includes('nologintools.org')
      ) {
        displayType = 'implicit';
      }
    }
  } catch {
    // Ignore fetch error, proceed to repo check
  }

  // 2. Check GitHub README (if not already explicit and repoUrl is set)
  if (displayType !== 'explicit' && tool.repoUrl) {
    const parsed = parseGitHubRepoUrl(tool.repoUrl);
    if (parsed) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const readmeUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/HEAD/README.md`;
        const readmeRes = await fetch(readmeUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'NoLoginTools-BadgeChecker/1.0',
          },
        });
        clearTimeout(timeout);

        if (readmeRes.ok) {
          const markdown = await readmeRes.text();
          if (
            markdown.includes('nologin.tools/badge.svg') ||
            markdown.includes('nologin.tools/badge/') ||
            markdown.includes('nologin.tools/badges/') ||
            markdown.includes('nologintools.org/badge') ||
            markdown.includes('nologintools.org/badges')
          ) {
            displayType = 'explicit';
          } else if (
            markdown.includes('nologin-verified') ||
            markdown.includes('nologin.tools') ||
            markdown.includes('nologintools.org')
          ) {
            if (displayType === 'none') {
              displayType = 'implicit';
            }
          }
        }
      } catch {
        // Ignore GitHub fetch error
      }
    }
  }

  const now = new Date();

  // UPSERT badge_displays
  await db
    .insert(badgeDisplays)
    .values({
      toolId: tool.id,
      displayType,
      lastCheckedAt: now,
    })
    .onConflictDoUpdate({
      target: badgeDisplays.toolId,
      set: {
        displayType,
        lastCheckedAt: now,
      },
    });

  return api.success({
    toolId: tool.id,
    displayType,
    lastCheckedAt: now.toISOString(),
  });
};

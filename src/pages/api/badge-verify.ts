export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, badgeDisplays } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../lib/api';
import { parseGitHubRepoUrl } from '../../lib/github';
import { isValidSlug } from '../../lib/utils';

const COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown between self-service checks

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { slug } = body ?? {};
  if (!isValidSlug(slug)) {
    return api.error('Valid tool slug is required.', 400);
  }

  const db = getDb(locals.runtime.env.DB);

  // Fetch approved tool
  const [tool] = await db
    .select({
      id: tools.id,
      name: tools.name,
      url: tools.url,
      slug: tools.slug,
      repoUrl: tools.repoUrl,
      status: tools.status,
    })
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  if (tool.status !== 'approved') {
    return api.error('Tool is not approved yet.', 400);
  }

  // Check rate-limiting / cooldown
  const [existingDisplay] = await db
    .select({
      id: badgeDisplays.id,
      displayType: badgeDisplays.displayType,
      lastCheckedAt: badgeDisplays.lastCheckedAt,
    })
    .from(badgeDisplays)
    .where(eq(badgeDisplays.toolId, tool.id))
    .limit(1);

  const now = new Date();
  if (existingDisplay?.lastCheckedAt) {
    const elapsed = now.getTime() - new Date(existingDisplay.lastCheckedAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return api.error(`Please wait ${waitSeconds}s before verifying again.`, 429, {
        cooldownSeconds: waitSeconds,
        displayType: existingDisplay.displayType,
        verified: existingDisplay.displayType === 'explicit',
      });
    }
  }

  let displayType: 'explicit' | 'implicit' | 'none' = 'none';

  // 1. Check primary website URL
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

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
    // Ignore fetch error, proceed to GitHub check
  }

  // 2. Check GitHub README (if not explicit and repoUrl is set)
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

  // Upsert badge_displays in D1
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

  const verified = displayType === 'explicit';

  return api.success({
    slug: tool.slug,
    toolName: tool.name,
    displayType,
    verified,
    lastCheckedAt: now.toISOString(),
    message: verified
      ? 'Level 3 Active Exhibitor status activated! +10 ranking boost is live.'
      : 'Badge not detected yet. Ensure your commit is published to your live site or default branch README.md, then try again.',
  });
};

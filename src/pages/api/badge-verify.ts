export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, badgeDisplays } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../lib/api';
import { parseGitHubRepoUrl } from '../../lib/github';
import { isValidSlug } from '../../lib/utils';
import { detectBadgeDisplayType } from '../../lib/badge';
import {
  fetchReviewQueueSnapshot,
  extractCandidateGitHubRepo,
  extractSameOriginScriptUrls,
} from '../../lib/queue';

const COOLDOWN_MS = 30 * 1000; // 30 seconds cooldown between self-service checks
const MAX_BUNDLE_CHARS = 800_000;

async function fetchTextWithCap(url: string, timeoutMs: number, maxChars = MAX_BUNDLE_CHARS): Promise<{ ok: boolean; url: string; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'NoLoginTools-BadgeChecker/1.0',
      },
    });
    if (!res.ok || !res.body) {
      return { ok: false, url: res.url || url, text: '' };
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (text.length < maxChars) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
    return { ok: true, url: res.url || url, text };
  } catch {
    return { ok: false, url, text: '' };
  } finally {
    clearTimeout(timer);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { slug, repoUrl: rawInputRepoUrl } = body ?? {};
  if (!isValidSlug(slug)) {
    return api.error('Valid tool slug is required.', 400);
  }

  const d1 = locals.runtime.env.DB;
  const db = getDb(d1);

  // Fetch tool (both pending and approved tools can verify badges)
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

  if (tool.status === 'rejected') {
    return api.error('This submission was rejected. Please resubmit the tool first.', 400);
  }

  // Optional user-supplied GitHub repo URL (e.g. when pending submitter embedded badge in README.md)
  let userRepoUrl: string | null = null;
  if (rawInputRepoUrl && typeof rawInputRepoUrl === 'string' && rawInputRepoUrl.trim()) {
    const parsedInput = parseGitHubRepoUrl(rawInputRepoUrl.trim());
    if (!parsedInput) {
      return api.error('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo).', 400);
    }
    userRepoUrl = `https://github.com/${parsedInput.owner}/${parsedInput.repo}`;
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
  if (existingDisplay?.lastCheckedAt && existingDisplay.displayType === 'explicit') {
    const elapsed = now.getTime() - new Date(existingDisplay.lastCheckedAt).getTime();
    if (elapsed < COOLDOWN_MS) {
      const waitSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return api.error(`Please wait ${waitSeconds}s before verifying again.`, 429, {
        cooldownSeconds: waitSeconds,
        displayType: existingDisplay.displayType,
        verified: true,
      });
    }
  }

  let displayType: 'explicit' | 'implicit' | 'none' = 'none';
  let sniffedRepoUrl: string | null = null;

  // 1. Check primary website URL (HTML + SPA entry bundle fallback for Vibe-Coded CSR apps)
  const pageRes = await fetchTextWithCap(tool.url, 12000, 600_000);
  if (pageRes.ok && pageRes.text) {
    const html = pageRes.text;
    displayType = detectBadgeDisplayType(html);

    if (!tool.repoUrl && !userRepoUrl) {
      sniffedRepoUrl = extractCandidateGitHubRepo(html);
    }

    // If raw HTML is a client-side SPA shell without explicit badge, inspect up to 2 same-origin entry JS bundles
    if (displayType !== 'explicit') {
      const scriptUrls = extractSameOriginScriptUrls(html, pageRes.url || tool.url, 2);
      for (const scriptUrl of scriptUrls) {
        const jsRes = await fetchTextWithCap(scriptUrl, 6000, MAX_BUNDLE_CHARS);
        if (jsRes.ok && jsRes.text) {
          const jsBadgeType = detectBadgeDisplayType(jsRes.text);
          if (jsBadgeType === 'explicit') {
            displayType = 'explicit';
            break;
          }
          if (jsBadgeType === 'implicit' && displayType === 'none') {
            displayType = 'implicit';
          }
        }
      }
    }
  }

  // 2. Check GitHub README (if not explicit yet, and we have a repoUrl from DB, user input, or HTML auto-sniff)
  const candidateRepoUrl = userRepoUrl || tool.repoUrl || sniffedRepoUrl;
  let verifiedViaRepoUrl: string | null = null;

  if (displayType !== 'explicit' && candidateRepoUrl) {
    const parsed = parseGitHubRepoUrl(candidateRepoUrl);
    if (parsed) {
      for (const filename of ['README.md', 'readme.md']) {
        const readmeUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/HEAD/${filename}`;
        const readmeRes = await fetchTextWithCap(readmeUrl, 10000, 400_000);
        if (readmeRes.ok && readmeRes.text) {
          const mdType = detectBadgeDisplayType(readmeRes.text);
          if (mdType === 'explicit') {
            displayType = 'explicit';
            verifiedViaRepoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
            break;
          } else if (mdType === 'implicit' && displayType === 'none') {
            displayType = 'implicit';
          }
        }
      }
    }
  }

  // Persist newly supplied or discovered repoUrl if the tool didn't have one
  const repoToSave = userRepoUrl || verifiedViaRepoUrl;
  if (repoToSave && (!tool.repoUrl || tool.status === 'pending')) {
    await db
      .update(tools)
      .set({ repoUrl: repoToSave })
      .where(eq(tools.id, tool.id));
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

  // If tool is pending, compute updated queue position so UI can immediately animate the jump
  let queuePosition = null;
  if (tool.status === 'pending') {
    try {
      const snapshot = await fetchReviewQueueSnapshot(d1, {
        limit: 5,
        lookupQuery: tool.slug,
      });
      queuePosition = snapshot.lookup;
    } catch {
      // Non-critical
    }
  }

  let message: string;
  if (verified) {
    if (tool.status === 'pending') {
      const posStr = queuePosition ? `#${queuePosition.position}` : '#1';
      const etaStr = queuePosition?.etaLabel?.en || '~24–48 hours';
      message = `⚡ Fast-Track Unlocked! Your tool jumped to Priority Queue ${posStr} (${etaStr}).`;
    } else {
      message = 'Level 3 Active Exhibitor status activated! +4 ranking boost is live.';
    }
  } else if (displayType === 'implicit') {
    message =
      'We detected a text/meta reference, but Priority Fast-Track & Level 3 status require a visible SVG badge on your website or GitHub README.md.';
  } else {
    message =
      'Badge not detected yet. Ensure your visible SVG badge is live on your website or default branch README.md, then try again.';
  }

  return api.success({
    slug: tool.slug,
    toolName: tool.name,
    toolStatus: tool.status,
    displayType,
    verified,
    repoUrl: repoToSave || tool.repoUrl || null,
    queuePosition,
    lastCheckedAt: now.toISOString(),
    message,
  });
};

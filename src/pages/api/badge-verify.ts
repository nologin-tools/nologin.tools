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

  const { slug, repoUrl: rawInputRepoUrl, customUrl: rawCustomUrl } = body ?? {};
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

  const toolHostname = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return '';
    }
  })();

  // Optional user-supplied URL: can be EITHER a GitHub repo URL OR a same-domain page URL (e.g. /about)
  const rawOptionalUrl = (typeof rawCustomUrl === 'string' && rawCustomUrl.trim())
    ? rawCustomUrl.trim()
    : (typeof rawInputRepoUrl === 'string' && rawInputRepoUrl.trim() ? rawInputRepoUrl.trim() : '');

  let userRepoUrl: string | null = null;
  let userSitePageUrl: string | null = null;

  if (rawOptionalUrl) {
    const parsedGh = parseGitHubRepoUrl(rawOptionalUrl);
    if (parsedGh) {
      userRepoUrl = `https://github.com/${parsedGh.owner}/${parsedGh.repo}`;
    } else {
      try {
        const candidateUrl = new URL(rawOptionalUrl.startsWith('http') ? rawOptionalUrl : `https://${rawOptionalUrl}`);
        const candidateHost = candidateUrl.hostname.replace(/^www\./i, '').toLowerCase();
        if (toolHostname && (candidateHost === toolHostname || candidateHost.endsWith(`.${toolHostname}`) || toolHostname.endsWith(`.${candidateHost}`))) {
          userSitePageUrl = candidateUrl.toString();
        } else {
          return api.error(
            `Optional URL must be either a GitHub repository (https://github.com/owner/repo) or a page on ${toolHostname}.`,
            400
          );
        }
      } catch {
        return api.error(
          `Please enter a valid GitHub repository URL (https://github.com/owner/repo) or a page URL on ${toolHostname}.`,
          400
        );
      }
    }
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
  let verifiedSource: string | null = null;
  const checkedTargets: string[] = [];

  async function scanWebPage(targetUrl: string): Promise<'explicit' | 'implicit' | 'none'> {
    if (!checkedTargets.includes(targetUrl)) {
      checkedTargets.push(targetUrl);
    }
    const pageRes = await fetchTextWithCap(targetUrl, 10000, 600_000);
    if (!pageRes.ok || !pageRes.text) return 'none';

    const html = pageRes.text;
    let foundType = detectBadgeDisplayType(html);
    if (!tool.repoUrl && !userRepoUrl && !sniffedRepoUrl) {
      sniffedRepoUrl = extractCandidateGitHubRepo(html);
    }
    if (foundType === 'explicit') {
      verifiedSource = targetUrl;
      return 'explicit';
    }

    // If raw HTML is a client-side SPA shell without explicit badge, inspect up to 2 same-origin entry JS bundles
    const scriptUrls = extractSameOriginScriptUrls(html, pageRes.url || targetUrl, 2);
    for (const scriptUrl of scriptUrls) {
      const jsRes = await fetchTextWithCap(scriptUrl, 6000, MAX_BUNDLE_CHARS);
      if (jsRes.ok && jsRes.text) {
        const jsBadgeType = detectBadgeDisplayType(jsRes.text);
        if (jsBadgeType === 'explicit') {
          verifiedSource = targetUrl;
          return 'explicit';
        }
        if (jsBadgeType === 'implicit' && foundType === 'none') {
          foundType = 'implicit';
        }
      }
    }
    return foundType;
  }

  // 1. Check user-specified same-domain page first (if provided), then primary tool.url, then root origin fallback
  const siteUrlsToScan: string[] = [];
  if (userSitePageUrl) siteUrlsToScan.push(userSitePageUrl);
  if (!siteUrlsToScan.includes(tool.url)) siteUrlsToScan.push(tool.url);
  try {
    const u = new URL(tool.url);
    if (u.pathname && u.pathname !== '/' && u.pathname !== '') {
      const rootOriginUrl = `${u.origin}/`;
      if (!siteUrlsToScan.includes(rootOriginUrl)) {
        siteUrlsToScan.push(rootOriginUrl);
      }
    }
  } catch {
    // ignore URL parse error
  }

  for (const pageUrl of siteUrlsToScan) {
    const resType = await scanWebPage(pageUrl);
    if (resType === 'explicit') {
      displayType = 'explicit';
      break;
    }
    if (resType === 'implicit' && displayType === 'none') {
      displayType = 'implicit';
    }
  }

  // 2. Check GitHub README (if not explicit yet, and we have a repoUrl from DB, user input, or HTML auto-sniff)
  const candidateRepoUrl = userRepoUrl || tool.repoUrl || sniffedRepoUrl;
  let verifiedViaRepoUrl: string | null = null;

  if (displayType !== 'explicit' && candidateRepoUrl) {
    const parsed = parseGitHubRepoUrl(candidateRepoUrl);
    if (parsed) {
      const repoLabel = `https://github.com/${parsed.owner}/${parsed.repo}#readme`;
      if (!checkedTargets.includes(repoLabel)) {
        checkedTargets.push(repoLabel);
      }
      for (const filename of ['README.md', 'readme.md']) {
        const readmeUrl = `https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/HEAD/${filename}`;
        const readmeRes = await fetchTextWithCap(readmeUrl, 10000, 400_000);
        if (readmeRes.ok && readmeRes.text) {
          const mdType = detectBadgeDisplayType(readmeRes.text);
          if (mdType === 'explicit') {
            displayType = 'explicit';
            verifiedViaRepoUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
            verifiedSource = repoLabel;
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

  const targetsStr = checkedTargets.join(', ');
  let messages: { en: string; zh: string };
  if (verified) {
    if (tool.status === 'pending') {
      const posStr = queuePosition ? `#${queuePosition.position}` : '#1';
      const etaEn = queuePosition?.etaLabel?.en || '~24–48 hours';
      const etaZh = queuePosition?.etaLabel?.zh || '预计 24–48 小时内';
      messages = {
        en: `⚡ Fast-Track Unlocked! Verified on ${verifiedSource || tool.url} — your tool jumped to Priority Queue ${posStr} (${etaEn}).`,
        zh: `⚡ 极速通道已激活！已在 ${verifiedSource || tool.url} 检测到官方徽章，工具已跃升至优先审核队列 ${posStr}（${etaZh}）。`,
      };
    } else {
      messages = {
        en: `Level 3 Active Exhibitor status activated on ${verifiedSource || tool.url}! +4 ranking boost is live.`,
        zh: `已在 ${verifiedSource || tool.url} 检测到官方徽章！Level 3 认证展商与 +4 算法排名加权已实时生效。`,
      };
    }
  } else if (displayType === 'implicit') {
    messages = {
      en: `Scanned ${targetsStr}: detected a text/meta link, but Priority Fast-Track & Level 3 require a visible SVG badge (/badge.svg) on your website or GitHub README.md.`,
      zh: `已扫描 ${targetsStr}：仅检测到普通文字或 Meta 链接。进入优先审核通道需在网页或 GitHub README 中展示可见的 SVG 徽章（含 /badge.svg）。`,
    };
  } else {
    messages = {
      en: `Scanned ${targetsStr} — visible SVG badge not detected yet. Make sure the badge is deployed on your live website footer (or GitHub README), then click Verify again.`,
      zh: `已扫描 ${targetsStr} —— 暂未检测到可见的 SVG 徽章。请确认徽章已部署到你的网站页脚（或 GitHub README），如果是纯前端 SPA 应用可使用下方 Vibe 提示词补齐静态标签后再试。`,
    };
  }

  return api.success({
    slug: tool.slug,
    toolName: tool.name,
    toolStatus: tool.status,
    displayType,
    verified,
    verifiedSource,
    checkedTargets,
    repoUrl: repoToSave || tool.repoUrl || null,
    queuePosition,
    lastCheckedAt: now.toISOString(),
    message: messages.en,
    messages,
  });
};

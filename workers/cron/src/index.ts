interface Env {
  DB: D1Database;
  SITE_URL: string;
  GITHUB_TOKEN?: string;
  ARCHIVE_ORG_ACCESS_KEY?: string;
  ARCHIVE_ORG_SECRET_KEY?: string;
}

interface ToolRow {
  id: number;
  slug: string;
  name: string;
  url: string;
  description: string | null;
  core_task: string;
  status: string;
  approved_at: number | null;
  archive_url: string | null;
  is_featured: number | null;
  repo_url: string | null;
  github_stars: number | null;
  github_language: string | null;
  github_license: string | null;
}

interface TagRow {
  tool_id: number;
  tag_key: string;
  tag_value: string;
}

/** Status codes that indicate the page is gone (not just blocked). */
const GONE_STATUS_CODES = new Set([404, 410]);

/** Returns true if the HTTP status indicates the server is reachable. */
function isReachable(status: number): boolean {
  return !GONE_STATUS_CODES.has(status);
}

const HEALTH_TOLERANCE = 5;
const HEALTH_WINDOW_HOURS = 48;

const CATEGORY_ORDER = [
  'AI', 'Design', 'Writing', 'Development', 'Productivity', 'Media',
  'Privacy', 'Data', 'Communication', 'Education', 'Finance',
];

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ) {
    const cron = controller.cron;

    if (cron === '0 */6 * * *') {
      await runHealthChecks(env, ctx);
    } else if (cron === '0 3 * * *') {
      await runDataExport(env, ctx);
    } else if (cron === '0 4 * * *') {
      await runBadgeDetection(env, ctx);
    } else if (cron === '0 5 * * *') {
      await runGitHubDataRefresh(env);
    }
  },
};

// ─── Health Checks (every 6 hours) ───

async function runHealthChecks(env: Env, ctx: ExecutionContext) {
  // Random sampling: check 15 tools per run instead of all approved tools.
  // This avoids hitting Cloudflare subrequest limits and reduces event-loop
  // contention that caused widespread false-offline results.
  const tools = await env.DB.prepare(
    "SELECT id, url, archive_url FROM tools WHERE status = 'approved' ORDER BY RANDOM() LIMIT 15"
  ).all<ToolRow>();

  const batch = tools.results || [];
  const batchSize = 3;

  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      chunk.map(async (tool) => {
        // Skip self-referencing requests — Cloudflare Workers cannot fetch
        // themselves without triggering a 522. The Worker running this code
        // already proves the site is online.
        try {
          if (new URL(tool.url).hostname === new URL(env.SITE_URL).hostname) {
            return {
              toolId: tool.id,
              isOnline: true,
              httpStatus: 200,
              responseTimeMs: 0,
              url: tool.url,
              archiveUrl: tool.archive_url,
            };
          }
        } catch {
          // Invalid URL — fall through to normal fetch
        }

        const start = Date.now();
        try {
          // Use GET directly — skipping HEAD avoids the shared-timeout bug
          // where HEAD consuming most of the timeout leaves GET with
          // insufficient time. Also halves subrequest count.
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(tool.url, {
            method: 'GET',
            headers: { 'User-Agent': 'NoLoginTools-HealthChecker/1.0' },
            signal: controller.signal,
            redirect: 'follow',
          });
          clearTimeout(timeout);

          return {
            toolId: tool.id,
            isOnline: isReachable(response.status),
            httpStatus: response.status,
            responseTimeMs: Date.now() - start,
            url: tool.url,
            archiveUrl: tool.archive_url,
          };
        } catch {
          return {
            toolId: tool.id,
            isOnline: false,
            httpStatus: null,
            responseTimeMs: null,
            url: tool.url,
            archiveUrl: tool.archive_url,
          };
        }
      })
    );

    const now = Math.floor(Date.now() / 1000);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const r = result.value;
        await env.DB.prepare(
          'INSERT INTO health_checks (tool_id, checked_at, is_online, http_status, response_time_ms) VALUES (?, ?, ?, ?, ?)'
        ).bind(r.toolId, now, r.isOnline ? 1 : 0, r.httpStatus, r.responseTimeMs).run();

        // Archive offline tools only after HEALTH_TOLERANCE consecutive failures within window
        if (
          !r.isOnline &&
          !r.archiveUrl &&
          env.ARCHIVE_ORG_ACCESS_KEY &&
          env.ARCHIVE_ORG_SECRET_KEY
        ) {
          const windowCutoff = Math.floor(Date.now() / 1000) - HEALTH_WINDOW_HOURS * 3600;
          const recentChecks = await env.DB.prepare(
            `SELECT is_online FROM health_checks WHERE tool_id = ? AND checked_at > ? ORDER BY checked_at DESC LIMIT ${HEALTH_TOLERANCE}`
          ).bind(r.toolId, windowCutoff).all<{ is_online: number }>();
          const rows = recentChecks.results || [];
          const allOffline = rows.length >= HEALTH_TOLERANCE && rows.every((row) => row.is_online === 0);
          if (allOffline) {
            ctx.waitUntil(archiveUrl(r.url, r.toolId, env));
          }
        }
      }
    }
  }

  // Clean up old health checks (older than 30 days)
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
  await env.DB.prepare(
    'DELETE FROM health_checks WHERE checked_at < ?'
  ).bind(thirtyDaysAgo).run();
}

async function archiveUrl(url: string, toolId: number, env: Env) {
  try {
    const response = await fetch('https://web.archive.org/save', {
      method: 'POST',
      headers: {
        Authorization: `LOW ${env.ARCHIVE_ORG_ACCESS_KEY}:${env.ARCHIVE_ORG_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url, capture_all: '1' }),
    });

    if (response.ok) {
      const archiveUrl = `https://web.archive.org/web/${url}`;
      await env.DB.prepare(
        'UPDATE tools SET archive_url = ? WHERE id = ?'
      ).bind(archiveUrl, toolId).run();
    }
  } catch {
    // Silently fail — will retry next run
  }
}

// ─── GitHub Data Refresh (daily 05:00 UTC) ───

async function runGitHubDataRefresh(env: Env) {
  // Priority 1: tools with repo_url set but never fetched (initial failure retry)
  // Priority 2: tools with stale data (fetched > 7 days ago)
  const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 86400;

  const toolsToRefresh = await env.DB.prepare(`
    SELECT id, repo_url FROM tools
    WHERE status IN ('approved', 'pending')
      AND repo_url IS NOT NULL
      AND repo_url != ''
      AND (github_fetched_at IS NULL OR github_fetched_at < ?)
    ORDER BY github_fetched_at IS NULL DESC, github_fetched_at ASC
    LIMIT 10
  `).bind(sevenDaysAgo).all<{ id: number; repo_url: string }>();

  const batch = toolsToRefresh.results || [];
  console.log(`[GitHubRefresh] ${batch.length} tools to refresh`);

  for (const tool of batch) {
    const parsed = parseGitHubRepoUrl(tool.repo_url);
    if (!parsed) {
      console.warn(`[GitHubRefresh] Invalid repo URL for tool #${tool.id}: ${tool.repo_url}`);
      continue;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
        headers: {
          'User-Agent': 'NoLoginTools-GitHubFetcher/1.0',
          Accept: 'application/vnd.github.v3+json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`[GitHubRefresh] API returned ${res.status} for tool #${tool.id}`);
        continue;
      }

      const data = await res.json() as {
        stargazers_count: number;
        forks_count: number;
        license: { spdx_id: string } | null;
        language: string | null;
        updated_at: string;
      };

      const now = Math.floor(Date.now() / 1000);
      const updatedAt = Math.floor(new Date(data.updated_at).getTime() / 1000);

      await env.DB.prepare(`
        UPDATE tools SET
          github_stars = ?,
          github_forks = ?,
          github_license = ?,
          github_language = ?,
          github_updated_at = ?,
          github_fetched_at = ?
        WHERE id = ?
      `).bind(
        data.stargazers_count,
        data.forks_count,
        data.license?.spdx_id || null,
        data.language,
        updatedAt,
        now,
        tool.id
      ).run();

      console.log(`[GitHubRefresh] Updated tool #${tool.id}: ⭐${data.stargazers_count} 🍴${data.forks_count}`);
    } catch (err: any) {
      console.error(`[GitHubRefresh] Failed for tool #${tool.id}: ${err.message}`);
    }
  }
}

/** Parse GitHub repo URL — inline version for cron worker (can't import src/lib). */
function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

// ─── Badge Display Detection (daily 04:00 UTC) ───

async function runBadgeDetection(env: Env, ctx: ExecutionContext) {
  const tools = await env.DB.prepare(
    "SELECT id, url FROM tools WHERE status = 'approved'"
  ).all<ToolRow>();

  const batch = tools.results || [];
  const batchSize = 5;
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < batch.length; i += batchSize) {
    const chunk = batch.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      chunk.map(async (tool) => {
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

          if (!response.ok) {
            return { toolId: tool.id, displayType: 'none' as const };
          }

          const html = await response.text();

          // Check for explicit badge (img/a with nologin.tools/badge)
          if (
            html.includes('nologin.tools/badge.svg') ||
            html.includes('nologin.tools/badge/') ||
            html.includes('nologin.tools/badges/')
          ) {
            return { toolId: tool.id, displayType: 'explicit' as const };
          }

          // Check for implicit (meta tag or nologin.tools link)
          if (
            html.includes('nologin-verified') ||
            html.includes('nologin.tools')
          ) {
            return { toolId: tool.id, displayType: 'implicit' as const };
          }

          return { toolId: tool.id, displayType: 'none' as const };
        } catch {
          return { toolId: tool.id, displayType: 'none' as const };
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const r = result.value;
        // UPSERT badge_displays
        await env.DB.prepare(
          `INSERT INTO badge_displays (tool_id, display_type, last_checked_at)
           VALUES (?, ?, ?)
           ON CONFLICT(tool_id) DO UPDATE SET display_type = excluded.display_type, last_checked_at = excluded.last_checked_at`
        ).bind(r.toolId, r.displayType, now).run();
      }
    }
  }
}

// ─── Data Export (daily 03:00 UTC) ───

async function runDataExport(env: Env, ctx: ExecutionContext) {
  const now = Math.floor(Date.now() / 1000);

  if (!env.GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not configured, skipping data export');
    try {
      await env.DB.prepare(
        'INSERT INTO data_exports (exported_at, tool_count, files_updated, trigger_source, status, error_message) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(now, 0, '[]', 'cron', 'error', 'GITHUB_TOKEN not configured').run();
    } catch (dbErr: any) {
      console.error(`Failed to record export skip: ${dbErr.message}`);
    }
    return;
  }

  let toolCount = 0;
  const filesUpdated: string[] = [];

  try {
    const tools = await env.DB.prepare(
      "SELECT id, slug, name, url, description, core_task, approved_at, is_featured, repo_url, github_stars, github_language, github_license FROM tools WHERE status = 'approved' ORDER BY name ASC"
    ).all<ToolRow>();

    const tags = await env.DB.prepare(
      "SELECT t.tool_id, t.tag_key, t.tag_value FROM tags t INNER JOIN tools ON tools.id = t.tool_id WHERE tools.status = 'approved'"
    ).all<TagRow>();

    const tagMap = new Map<number, { key: string; value: string }[]>();
    for (const tag of tags.results || []) {
      if (!tagMap.has(tag.tool_id)) tagMap.set(tag.tool_id, []);
      tagMap.get(tag.tool_id)!.push({
        key: tag.tag_key,
        value: tag.tag_value,
      });
    }

    const toolsList = (tools.results || []).map((t) => {
      const toolTags = tagMap.get(t.id) || [];
      const category = toolTags.find((tag) => tag.key === 'category')?.value || null;
      return {
        slug: t.slug,
        name: t.name,
        url: t.url,
        description: t.description,
        coreTask: t.core_task,
        category,
        featured: !!t.is_featured,
        repoUrl: t.repo_url || null,
        githubStars: t.github_stars ?? null,
      };
    });

    toolCount = toolsList.length;
    console.log(`Data export: ${toolCount} approved tools`);

    // Generate tools.json
    const toolsJson = JSON.stringify(toolsList, null, 2);

    // Generate README.md
    const readme = generateReadme(toolsList);

    // Push to GitHub
    const repo = 'nologin-tools/awesome-nologin-tools';

    const jsonResult = await pushToGithub(env.GITHUB_TOKEN, repo, 'tools.json', toolsJson);
    if (jsonResult.updated) filesUpdated.push('tools.json');

    const readmeResult = await pushToGithub(env.GITHUB_TOKEN, repo, 'README.md', readme);
    if (readmeResult.updated) filesUpdated.push('README.md');

    console.log(`Data export complete: tools.json ${filesUpdated.includes('tools.json') ? 'updated' : 'unchanged'}, README.md ${filesUpdated.includes('README.md') ? 'updated' : 'unchanged'}`);

    // Record success
    await env.DB.prepare(
      'INSERT INTO data_exports (exported_at, tool_count, files_updated, trigger_source, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(now, toolCount, JSON.stringify(filesUpdated), 'cron', 'success').run();
  } catch (err: any) {
    console.error(`Data export failed: ${err.message}`);

    // Record failure
    try {
      await env.DB.prepare(
        'INSERT INTO data_exports (exported_at, tool_count, files_updated, trigger_source, status, error_message) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(now, toolCount, JSON.stringify(filesUpdated), 'cron', 'error', (err.message || '').slice(0, 500)).run();
    } catch (dbErr: any) {
      console.error(`Failed to record export error: ${dbErr.message}`);
    }
  }
}

function generateReadme(
  tools: {
    name: string;
    url: string;
    description: string | null;
    coreTask: string;
    category: string | null;
    featured: boolean;
    repoUrl?: string | null;
    githubStars?: number | null;
  }[]
): string {
  const toolCount = tools.length;

  let md = `# Awesome NoLogin Tools\n\n`;
  md += `[![Awesome](https://img.shields.io/badge/Awesome-fc60a8?logo=awesomelists&logoColor=white)](https://github.com/nologin-tools/awesome-nologin-tools)\n`;
  md += `[![Tools](https://img.shields.io/badge/Tools-${toolCount}-4c1)](https://nologin.tools)\n`;
  md += `[![License: CC0](https://img.shields.io/badge/License-CC0_1.0-lightgrey)](https://creativecommons.org/publicdomain/zero/1.0/)\n`;
  md += `[![Website](https://img.shields.io/badge/nologin.tools-Visit-blue)](https://nologin.tools)\n`;
  md += `[![Submit a Tool](https://img.shields.io/badge/Submit_a_Tool-orange)](https://nologin.tools/submit)\n\n`;
  md += `[![NoLogin Verified](https://nologin.tools/badges/flat.svg)](https://nologin.tools/badge/awesome-nologin-tools)\n\n`;
  md += `> A curated list of privacy-friendly tools that work without requiring login or registration.\n`;
  md += `> Auto-generated from [nologin.tools](https://nologin.tools).\n\n`;
  md += `## Discover & Submit\n\n`;
  md += `Browse and search all tools at **[nologin.tools](https://nologin.tools)**.\n\n`;
  md += `Know a great tool that works without login? **[Submit it here](https://nologin.tools/submit)**!\n\n`;

  // Group by category
  const groups = new Map<string, typeof tools>();
  for (const tool of tools) {
    const cat = tool.category || 'Other';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(tool);
  }

  // Output in defined order, then "Other" at the end
  const orderedCategories = [...CATEGORY_ORDER.filter((c) => groups.has(c))];
  if (groups.has('Other')) orderedCategories.push('Other');

  for (const cat of orderedCategories) {
    const catTools = groups.get(cat)!;
    md += `## ${cat}\n\n`;
    for (const tool of catTools) {
      const star = tool.featured ? ' ★' : '';
      const repoSuffix = tool.repoUrl ? ` ([Source](${tool.repoUrl})${tool.githubStars != null ? ` ⭐${tool.githubStars}` : ''})` : '';
      md += `- **[${tool.name}${star}](${tool.url})**${repoSuffix} — ${tool.description || tool.coreTask}\n`;
      md += `  > _No-login task: ${tool.coreTask}_\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `## License\n\n`;
  md += `[![CC0](https://licensebuttons.net/p/zero/1.0/88x31.png)](https://creativecommons.org/publicdomain/zero/1.0/)\n\n`;
  md += `To the extent possible under law, the contributors have waived all copyright and related or neighboring rights to this work. See the [LICENSE](LICENSE) file for details.\n\n`;
  md += `---\n\n`;
  md += `Generated by [nologin.tools](https://nologin.tools) · [Submit a tool](https://nologin.tools/submit)\n`;
  return md;
}

async function pushToGithub(
  token: string,
  repo: string,
  path: string,
  content: string
): Promise<{ updated: boolean }> {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'User-Agent': 'NoLoginTools-Exporter/1.0',
  };

  // Get current file SHA and content (if exists)
  let sha: string | undefined;
  let existingContent: string | undefined;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = (await res.json()) as { sha: string; content: string };
      sha = data.sha;
      try {
        existingContent = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))));
      } catch {
        // Decoding failed — treat as changed
      }
    }
  } catch {
    // File doesn't exist yet or request failed
  }

  // Skip push if content is unchanged
  if (existingContent !== undefined && existingContent === content) {
    console.log(`${path} unchanged, skipped`);
    return { updated: false };
  }

  // Create or update file
  const committer = { name: 'nologin-bot', email: 'bot@nologin.tools' };
  const body: Record<string, any> = {
    message: `Update ${path}`,
    content: btoa(unescape(encodeURIComponent(content))),
    committer,
    author: committer,
  };
  if (sha) body.sha = sha;

  const putController = new AbortController();
  const putTimeout = setTimeout(() => putController.abort(), 30000);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: putController.signal,
  });
  clearTimeout(putTimeout);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const msg = `Failed to push ${path}: ${res.status} ${text.slice(0, 200)}`;
    console.error(msg);
    throw new Error(msg);
  }

  console.log(`Pushed ${path}`);
  return { updated: true };
}

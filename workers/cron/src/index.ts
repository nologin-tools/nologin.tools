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
}

interface TagRow {
  tool_id: number;
  tag_key: string;
  tag_value: string;
}

const CATEGORY_ORDER = [
  'Design', 'Writing', 'Development', 'Productivity', 'Media',
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
    }
  },
};

// ─── Health Checks (every 6 hours) ───

async function runHealthChecks(env: Env, ctx: ExecutionContext) {
  const tools = await env.DB.prepare(
    "SELECT id, url, archive_url FROM tools WHERE status = 'approved'"
  ).all<ToolRow>();

  const batch = tools.results || [];
  const batchSize = 10;

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
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          let response: Response;
          try {
            response = await fetch(tool.url, {
              method: 'HEAD',
              headers: { 'User-Agent': 'NoLoginTools-HealthChecker/1.0' },
              signal: controller.signal,
              redirect: 'follow',
            });
          } catch {
            response = await fetch(tool.url, {
              method: 'GET',
              headers: { 'User-Agent': 'NoLoginTools-HealthChecker/1.0' },
              signal: controller.signal,
              redirect: 'follow',
            });
          }
          clearTimeout(timeout);

          return {
            toolId: tool.id,
            isOnline: response.ok,
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

        // Archive offline tools only after 3 consecutive failures
        if (
          !r.isOnline &&
          !r.archiveUrl &&
          env.ARCHIVE_ORG_ACCESS_KEY &&
          env.ARCHIVE_ORG_SECRET_KEY
        ) {
          const recentChecks = await env.DB.prepare(
            'SELECT is_online FROM health_checks WHERE tool_id = ? ORDER BY checked_at DESC LIMIT 3'
          ).bind(r.toolId).all<{ is_online: number }>();
          const rows = recentChecks.results || [];
          const allOffline = rows.length >= 3 && rows.every((row) => row.is_online === 0);
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
  if (!env.GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not configured, skipping data export');
    return;
  }

  const now = Math.floor(Date.now() / 1000);

  const tools = await env.DB.prepare(
    "SELECT id, slug, name, url, description, core_task, approved_at FROM tools WHERE status = 'approved' ORDER BY name ASC"
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
    };
  });

  console.log(`Data export: ${toolsList.length} approved tools`);

  // Generate tools.json
  const toolsJson = JSON.stringify(toolsList, null, 2);

  // Generate README.md
  const readme = generateReadme(toolsList);

  // Push to GitHub
  const repo = 'nologin-tools/awesome-nologin-tools';
  const filesUpdated: string[] = [];

  try {
    const jsonResult = await pushToGithub(env.GITHUB_TOKEN, repo, 'tools.json', toolsJson);
    if (jsonResult.updated) filesUpdated.push('tools.json');

    const readmeResult = await pushToGithub(env.GITHUB_TOKEN, repo, 'README.md', readme);
    if (readmeResult.updated) filesUpdated.push('README.md');

    console.log(`Data export complete: tools.json ${filesUpdated.includes('tools.json') ? 'updated' : 'unchanged'}, README.md ${filesUpdated.includes('README.md') ? 'updated' : 'unchanged'}`);

    // Record success
    await env.DB.prepare(
      'INSERT INTO data_exports (exported_at, tool_count, files_updated, trigger_source, status) VALUES (?, ?, ?, ?, ?)'
    ).bind(now, toolsList.length, JSON.stringify(filesUpdated), 'cron', 'success').run();
  } catch (err: any) {
    console.error(`Data export failed: ${err.message}`);

    // Record failure
    await env.DB.prepare(
      'INSERT INTO data_exports (exported_at, tool_count, files_updated, trigger_source, status, error_message) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(now, toolsList.length, JSON.stringify(filesUpdated), 'cron', 'error', (err.message || '').slice(0, 500)).run();
  }
}

function generateReadme(
  tools: {
    name: string;
    url: string;
    description: string | null;
    coreTask: string;
    category: string | null;
  }[]
): string {
  let md = `# Awesome NoLogin Tools\n\n`;
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
      md += `- **[${tool.name}](${tool.url})** — ${tool.description || tool.coreTask}\n`;
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

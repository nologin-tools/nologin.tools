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
              signal: controller.signal,
              redirect: 'follow',
            });
          } catch {
            response = await fetch(tool.url, {
              method: 'GET',
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

        // Archive offline tools that don't have an archive URL
        if (
          !r.isOnline &&
          !r.archiveUrl &&
          env.ARCHIVE_ORG_ACCESS_KEY &&
          env.ARCHIVE_ORG_SECRET_KEY
        ) {
          ctx.waitUntil(archiveUrl(r.url, r.toolId, env));
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
  if (!env.GITHUB_TOKEN) return;

  const tools = await env.DB.prepare(
    "SELECT id, slug, name, url, description, core_task, approved_at FROM tools WHERE status = 'approved' ORDER BY name ASC"
  ).all<ToolRow>();

  const tags = await env.DB.prepare(
    'SELECT tool_id, tag_key, tag_value FROM tags'
  ).all<TagRow>();

  const tagMap = new Map<number, { key: string; value: string }[]>();
  for (const tag of tags.results || []) {
    if (!tagMap.has(tag.tool_id)) tagMap.set(tag.tool_id, []);
    tagMap.get(tag.tool_id)!.push({
      key: tag.tag_key,
      value: tag.tag_value,
    });
  }

  const toolsList = (tools.results || []).map((t) => ({
    slug: t.slug,
    name: t.name,
    url: t.url,
    description: t.description,
    coreTask: t.core_task,
    tags: tagMap.get(t.id) || [],
  }));

  // Generate tools.json
  const toolsJson = JSON.stringify(toolsList, null, 2);

  // Generate README.md
  const readme = generateReadme(toolsList);

  // Push to GitHub
  const repo = 'nologin-tools/awesome-nologin-tools';
  await pushToGithub(env.GITHUB_TOKEN, repo, 'tools.json', toolsJson);
  await pushToGithub(env.GITHUB_TOKEN, repo, 'README.md', readme);
}

function generateReadme(
  tools: {
    name: string;
    url: string;
    description: string | null;
    coreTask: string;
    tags: { key: string; value: string }[];
  }[]
): string {
  let md = `# Awesome NoLogin Tools\n\n`;
  md += `> A curated list of tools that work without login. Auto-generated from [nologin.tools](https://nologin.tools).\n\n`;
  md += `## Tools\n\n`;

  for (const tool of tools) {
    const tagStr = tool.tags.map((t) => `\`${t.key}:${t.value}\``).join(' ');
    md += `- [${tool.name}](${tool.url}) — ${tool.description || tool.coreTask}`;
    if (tagStr) md += ` ${tagStr}`;
    md += `\n`;
  }

  md += `\n---\n\nGenerated by [nologin.tools](https://nologin.tools) on ${new Date().toISOString().split('T')[0]}.\n`;
  return md;
}

async function pushToGithub(
  token: string,
  repo: string,
  path: string,
  content: string
) {
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  // Get current file SHA (if exists)
  let sha: string | undefined;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'NoLoginTools-Exporter/1.0',
      },
    });
    if (res.ok) {
      const data = (await res.json()) as { sha: string };
      sha = data.sha;
    }
  } catch {
    // File doesn't exist yet
  }

  // Create or update file
  const body: Record<string, string> = {
    message: `Update ${path} — ${new Date().toISOString().split('T')[0]}`,
    content: btoa(unescape(encodeURIComponent(content))),
  };
  if (sha) body.sha = sha;

  await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'NoLoginTools-Exporter/1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, githubNotifications } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../../lib/api';
import { parseGitHubRepoUrl, createGitHubNotificationIssue } from '../../../lib/github';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret, toolId, force } = body;

  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (!toolId || typeof toolId !== 'number') {
    return api.error('toolId is required.', 400);
  }

  const githubToken = env.GITHUB_TOKEN as string | undefined;
  if (!githubToken) {
    return api.error('GITHUB_TOKEN is not configured.', 500);
  }

  const [tool] = await db
    .select({
      id: tools.id,
      name: tools.name,
      url: tools.url,
      slug: tools.slug,
      status: tools.status,
      repoUrl: tools.repoUrl,
    })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  if (tool.status !== 'approved') {
    return api.error('Tool must be approved to send notification.', 400);
  }

  if (!tool.repoUrl) {
    return api.error('Tool has no repository URL.', 400);
  }

  const parsed = parseGitHubRepoUrl(tool.repoUrl);
  if (!parsed) {
    return api.error('Invalid GitHub repository URL.', 400);
  }

  // Idempotency check
  const [existing] = await db
    .select()
    .from(githubNotifications)
    .where(eq(githubNotifications.toolId, toolId))
    .limit(1);

  if (existing && existing.status === 'created' && !force) {
    return api.error('Notification already sent. Use force=true to resend.', 409, {
      issueUrl: existing.issueUrl || '',
      issueNumber: String(existing.issueNumber || ''),
    });
  }

  const siteUrl = (env.SITE_URL as string) || 'https://nologin.tools';

  try {
    const result = await createGitHubNotificationIssue(
      parsed.owner,
      parsed.repo,
      tool.name,
      tool.url,
      tool.slug,
      siteUrl,
      githubToken,
    );

    if (!result) {
      // Upsert error record
      if (existing) {
        await db.update(githubNotifications).set({
          status: 'error',
          errorMessage: 'Failed to create issue (API returned non-ok)',
          createdAt: new Date(),
        }).where(eq(githubNotifications.toolId, toolId));
      } else {
        await db.insert(githubNotifications).values({
          toolId,
          status: 'error',
          errorMessage: 'Failed to create issue (API returned non-ok)',
          createdAt: new Date(),
        });
      }
      return api.error('Failed to create GitHub issue.', 502);
    }

    // Upsert success record
    if (existing) {
      await db.update(githubNotifications).set({
        issueUrl: result.issueUrl,
        issueNumber: result.issueNumber,
        status: 'created',
        errorMessage: null,
        createdAt: new Date(),
      }).where(eq(githubNotifications.toolId, toolId));
    } else {
      await db.insert(githubNotifications).values({
        toolId,
        issueUrl: result.issueUrl,
        issueNumber: result.issueNumber,
        status: 'created',
        createdAt: new Date(),
      });
    }

    return api.success({
      toolId,
      issueUrl: result.issueUrl,
      issueNumber: result.issueNumber,
    });
  } catch (err: any) {
    const errorMessage = err?.message || 'Unknown error';

    // Upsert error record
    if (existing) {
      await db.update(githubNotifications).set({
        status: 'error',
        errorMessage,
        createdAt: new Date(),
      }).where(eq(githubNotifications.toolId, toolId));
    } else {
      await db.insert(githubNotifications).values({
        toolId,
        status: 'error',
        errorMessage,
        createdAt: new Date(),
      });
    }

    return api.error(`Failed to create issue: ${errorMessage}`, 502);
  }
};

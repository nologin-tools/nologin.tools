export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, tags, healthChecks } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { urlToSlug, hashIp, getClientIp } from '../../lib/utils';
import { api } from '../../lib/api';
import { archiveUrl } from '../../lib/archive';
import { checkHealth } from '../../lib/health';
import { TAG_DEFINITIONS } from '../../lib/tags';
import { validateTwitterUrl, validateGitHubProfileUrl, validateDiscordUrl, validateRepoUrl, parseGitHubRepoUrl, fetchGitHubRepoData } from '../../lib/github';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals.runtime.env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { name, url, description, pledge, coreTask, submitterEmail, repoUrl, twitterUrl, githubUrl, discordUrl, tags: submittedTags } = body;

  // Validation
  const errors: Record<string, string> = {};

  if (!name || typeof name !== 'string' || name.length < 2 || name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters.';
  }

  if (!url || typeof url !== 'string') {
    errors.url = 'A valid URL is required.';
  } else {
    try {
      new URL(url);
    } catch {
      errors.url = 'Please enter a valid URL.';
    }
  }

  if (!description || typeof description !== 'string' || description.length > 500) {
    errors.description = 'Description is required (max 500 characters).';
  }

  if (!pledge) {
    errors.pledge = 'You must confirm the no-login pledge.';
  }

  if (!coreTask || typeof coreTask !== 'string' || coreTask.length > 200) {
    errors.coreTask = 'Core task description is required (max 200 characters).';
  }

  if (submitterEmail != null && submitterEmail !== '') {
    if (typeof submitterEmail !== 'string' || submitterEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
      errors.submitterEmail = 'Please enter a valid email address.';
    }
  }

  if (repoUrl && typeof repoUrl === 'string' && repoUrl.trim()) {
    if (!validateRepoUrl(repoUrl.trim())) {
      errors.repoUrl = 'Please enter a valid GitHub repository URL.';
    }
  }
  if (twitterUrl && typeof twitterUrl === 'string' && twitterUrl.trim()) {
    if (!validateTwitterUrl(twitterUrl.trim())) {
      errors.twitterUrl = 'Please enter a valid Twitter/X URL.';
    }
  }
  if (githubUrl && typeof githubUrl === 'string' && githubUrl.trim()) {
    if (!validateGitHubProfileUrl(githubUrl.trim())) {
      errors.githubUrl = 'Please enter a valid GitHub URL.';
    }
  }
  if (discordUrl && typeof discordUrl === 'string' && discordUrl.trim()) {
    if (!validateDiscordUrl(discordUrl.trim())) {
      errors.discordUrl = 'Please enter a valid Discord URL.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return api.error('Validation failed.', 400, errors);
  }

  // Generate slug
  const slug = urlToSlug(url);

  // Check for duplicate
  const existing = await db
    .select({ id: tools.id, slug: tools.slug, status: tools.status })
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);

  if (existing.length > 0) {
    return api.error('This tool has already been submitted.', 409, {
      url: 'This URL has already been submitted.',
      slug: existing[0].slug,
      status: existing[0].status,
    });
  }

  // Rate limiting
  const maxSubmissions = parseInt(locals.runtime.env.RATE_LIMIT_MAX_SUBMISSIONS || '3', 10) || 3;
  const windowHours = parseInt(locals.runtime.env.RATE_LIMIT_WINDOW_HOURS || '24', 10) || 24;

  const clientIp = getClientIp(request);
  const ipHash = await hashIp(clientIp);
  const windowStart = new Date(Date.now() - windowHours * 3600000);

  const recentSubmissions = await db
    .select({ id: tools.id })
    .from(tools)
    .where(
      and(
        eq(tools.submitterIpHash, ipHash),
        sql`${tools.submittedAt} > ${Math.floor(windowStart.getTime() / 1000)}`
      )
    );

  if (recentSubmissions.length >= maxSubmissions) {
    const windowLabel = windowHours === 24 ? 'daily' : `${windowHours}-hour`;
    return api.error(
      `You have reached the ${windowLabel} submission limit (${maxSubmissions} per ${windowHours}h). Please try again later.`,
      429
    );
  }

  // Validate tags
  const validTags: { key: string; value: string }[] = [];
  if (Array.isArray(submittedTags)) {
    for (const tag of submittedTags) {
      if (tag.key && tag.value) {
        const def = TAG_DEFINITIONS.find((d) => d.key === tag.key);
        if (def && def.values.includes(tag.value)) {
          validTags.push({ key: tag.key, value: tag.value });
        }
      }
    }
  }

  // Auto-derive source tag from repo URL
  const trimmedRepoUrl = repoUrl && typeof repoUrl === 'string' ? repoUrl.trim() : '';
  if (trimmedRepoUrl) {
    validTags.push({ key: 'source', value: 'Open Source' });
  }

  // Insert tool
  const now = new Date();
  const [inserted] = await db
    .insert(tools)
    .values({
      slug,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      coreTask: coreTask.trim(),
      noLoginPledge: true,
      status: 'pending',
      submittedAt: now,
      submitterIpHash: ipHash,
      submitterEmail: submitterEmail ? submitterEmail.trim() : null,
      repoUrl: trimmedRepoUrl || null,
      twitterUrl: twitterUrl && typeof twitterUrl === 'string' && twitterUrl.trim() ? twitterUrl.trim() : null,
      githubUrl: githubUrl && typeof githubUrl === 'string' && githubUrl.trim() ? githubUrl.trim() : null,
      discordUrl: discordUrl && typeof discordUrl === 'string' && discordUrl.trim() ? discordUrl.trim() : null,
    })
    .returning({ id: tools.id, slug: tools.slug });

  // Insert tags
  if (validTags.length > 0) {
    await db.insert(tags).values(
      validTags.map((t) => ({
        toolId: inserted.id,
        tagKey: t.key,
        tagValue: t.value,
      }))
    );
  }

  // Archive URL asynchronously (fire and forget via waitUntil)
  const env = locals.runtime.env;
  const ctx = locals.runtime.ctx;
  if (env.ARCHIVE_ORG_ACCESS_KEY && env.ARCHIVE_ORG_SECRET_KEY) {
    ctx.waitUntil(
      archiveUrl(url, env.ARCHIVE_ORG_ACCESS_KEY, env.ARCHIVE_ORG_SECRET_KEY)
        .then(async (archiveUrlResult) => {
          if (archiveUrlResult) {
            await db
              .update(tools)
              .set({ archiveUrl: archiveUrlResult })
              .where(eq(tools.id, inserted.id));
          }
        })
        .catch(() => {
          // Archive is best-effort; failure is non-critical
        })
    );
  }

  // Health check asynchronously (fire and forget via waitUntil)
  ctx.waitUntil(
    checkHealth(url, env.SITE_URL)
      .then(async (result) => {
        await db.insert(healthChecks).values({
          toolId: inserted.id,
          checkedAt: new Date(),
          isOnline: result.isOnline,
          httpStatus: result.httpStatus,
          responseTimeMs: result.responseTimeMs,
        });
      })
      .catch(() => {})
  );

  // Fetch GitHub repo data asynchronously
  if (trimmedRepoUrl) {
    const parsed = parseGitHubRepoUrl(trimmedRepoUrl);
    if (parsed) {
      ctx.waitUntil(
        fetchGitHubRepoData(parsed.owner, parsed.repo)
          .then(async (data) => {
            if (data) {
              await db
                .update(tools)
                .set({
                  githubStars: data.stars,
                  githubForks: data.forks,
                  githubLicense: data.license,
                  githubLanguage: data.language,
                  githubUpdatedAt: data.updatedAt,
                  githubFetchedAt: new Date(),
                })
                .where(eq(tools.id, inserted.id));
              console.log(`[Submit] GitHub data saved for tool #${inserted.id}`);
            } else {
              console.warn(`[Submit] No GitHub data returned for ${trimmedRepoUrl}`);
            }
          })
          .catch((err) => {
            console.error(`[Submit] GitHub data fetch/save failed:`, err);
          })
      );
    }
  }

  return api.success({ slug: inserted.slug }, 201);
};

export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, tags, healthChecks } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { urlToSlug } from '../../lib/utils';
import { api } from '../../lib/api';
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

  const { toolId, name, url, description, pledge, coreTask, submitterEmail, repoUrl, twitterUrl, githubUrl, discordUrl, tags: submittedTags } = body;

  // Validate toolId
  if (!toolId || typeof toolId !== 'number') {
    return api.error('Tool ID is required.', 400);
  }

  // Fetch the tool and verify it's rejected
  const [tool] = await db
    .select({ id: tools.id, slug: tools.slug, status: tools.status })
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  if (tool.status !== 'rejected') {
    return api.error('Only rejected tools can be resubmitted.', 400);
  }

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

  // Recompute slug if URL changed
  const newSlug = urlToSlug(url);

  // Check for slug conflict if slug changed
  if (newSlug !== tool.slug) {
    const conflict = await db
      .select({ id: tools.id })
      .from(tools)
      .where(and(eq(tools.slug, newSlug), ne(tools.id, toolId)))
      .limit(1);

    if (conflict.length > 0) {
      return api.error('A tool with this URL already exists.', 409, {
        url: 'This URL belongs to another tool.',
      });
    }
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

  // Update tool
  const now = new Date();
  await db
    .update(tools)
    .set({
      slug: newSlug,
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      coreTask: coreTask.trim(),
      noLoginPledge: true,
      status: 'pending',
      rejectionReason: null,
      submittedAt: now,
      submitterEmail: submitterEmail ? submitterEmail.trim() : null,
      repoUrl: trimmedRepoUrl || null,
      twitterUrl: twitterUrl && typeof twitterUrl === 'string' && twitterUrl.trim() ? twitterUrl.trim() : null,
      githubUrl: githubUrl && typeof githubUrl === 'string' && githubUrl.trim() ? githubUrl.trim() : null,
      discordUrl: discordUrl && typeof discordUrl === 'string' && discordUrl.trim() ? discordUrl.trim() : null,
    })
    .where(eq(tools.id, toolId));

  // Delete old tags and insert new ones
  await db.delete(tags).where(eq(tags.toolId, toolId));

  if (validTags.length > 0) {
    await db.insert(tags).values(
      validTags.map((t) => ({
        toolId,
        tagKey: t.key,
        tagValue: t.value,
      }))
    );
  }

  // Health check asynchronously (fire and forget via waitUntil)
  locals.runtime.ctx.waitUntil(
    checkHealth(url, locals.runtime.env.SITE_URL)
      .then(async (result) => {
        await db.insert(healthChecks).values({
          toolId,
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
      locals.runtime.ctx.waitUntil(
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
                .where(eq(tools.id, toolId));
            }
          })
          .catch(() => {})
      );
    }
  }

  return api.success({ slug: newSlug });
};

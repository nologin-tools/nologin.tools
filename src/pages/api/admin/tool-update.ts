export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags } from '../../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { urlToSlug } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { TAG_DEFINITIONS } from '../../../lib/tags';
import { validateTwitterUrl, validateGitHubProfileUrl, validateDiscordUrl, validateRepoUrl, parseGitHubRepoUrl, fetchGitHubRepoData } from '../../../lib/github';

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

  // Fetch existing tool
  const [tool] = await db
    .select()
    .from(tools)
    .where(eq(tools.id, toolId))
    .limit(1);

  if (!tool) {
    return api.error('Tool not found.', 404);
  }

  // Build update fields
  const updateData: Record<string, any> = {};
  const errors: Record<string, string> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (name.length < 2 || name.length > 100) {
      errors.name = 'Name must be between 2 and 100 characters.';
    } else {
      updateData.name = name;
    }
  }

  if (body.url !== undefined) {
    const url = String(body.url).trim();
    try {
      new URL(url);
    } catch {
      errors.url = 'Please enter a valid URL.';
    }
    if (!errors.url) {
      updateData.url = url;
      const newSlug = urlToSlug(url);
      if (newSlug !== tool.slug) {
        const conflict = await db
          .select({ id: tools.id })
          .from(tools)
          .where(and(eq(tools.slug, newSlug), ne(tools.id, toolId)))
          .limit(1);
        if (conflict.length > 0) {
          errors.url = 'A tool with this URL already exists.';
        } else {
          updateData.slug = newSlug;
        }
      }
    }
  }

  if (body.description !== undefined) {
    const desc = String(body.description).trim();
    if (desc.length > 500) {
      errors.description = 'Description must be max 500 characters.';
    } else {
      updateData.description = desc;
    }
  }

  if (body.coreTask !== undefined) {
    const ct = String(body.coreTask).trim();
    if (ct.length > 200) {
      errors.coreTask = 'Core task must be max 200 characters.';
    } else {
      updateData.coreTask = ct;
    }
  }

  if (body.repoUrl !== undefined) {
    const val = String(body.repoUrl).trim();
    if (val && !validateRepoUrl(val)) {
      errors.repoUrl = 'Please enter a valid GitHub repository URL.';
    } else {
      updateData.repoUrl = val || null;
    }
  }

  if (body.twitterUrl !== undefined) {
    const val = String(body.twitterUrl).trim();
    if (val && !validateTwitterUrl(val)) {
      errors.twitterUrl = 'Please enter a valid Twitter/X URL.';
    } else {
      updateData.twitterUrl = val || null;
    }
  }

  if (body.githubUrl !== undefined) {
    const val = String(body.githubUrl).trim();
    if (val && !validateGitHubProfileUrl(val)) {
      errors.githubUrl = 'Please enter a valid GitHub URL.';
    } else {
      updateData.githubUrl = val || null;
    }
  }

  if (body.discordUrl !== undefined) {
    const val = String(body.discordUrl).trim();
    if (val && !validateDiscordUrl(val)) {
      errors.discordUrl = 'Please enter a valid Discord URL.';
    } else {
      updateData.discordUrl = val || null;
    }
  }

  if (Object.keys(errors).length > 0) {
    return api.error('Validation failed.', 400, errors);
  }

  // Update tool fields
  if (Object.keys(updateData).length > 0) {
    await db.update(tools).set(updateData).where(eq(tools.id, toolId));
  }

  // Update tags if provided
  if (body.tags !== undefined && Array.isArray(body.tags)) {
    const validTags: { key: string; value: string }[] = [];
    for (const tag of body.tags) {
      if (tag.key && tag.value) {
        // Allow source tags (auto-derived) and TAG_DEFINITIONS tags
        if (tag.key === 'source' && (tag.value === 'Open Source' || tag.value === 'Closed Source')) {
          validTags.push({ key: tag.key, value: tag.value });
        } else {
          const def = TAG_DEFINITIONS.find((d) => d.key === tag.key);
          if (def && def.values.includes(tag.value)) {
            validTags.push({ key: tag.key, value: tag.value });
          }
        }
      }
    }

    // Auto-derive source tag: remove existing source tags, add if repo_url present
    const filteredTags = validTags.filter(t => t.key !== 'source');
    const effectiveRepoUrl = updateData.repoUrl !== undefined ? updateData.repoUrl : tool.repoUrl;
    if (effectiveRepoUrl) {
      filteredTags.push({ key: 'source', value: 'Open Source' });
    }

    await db.delete(tags).where(eq(tags.toolId, toolId));
    if (filteredTags.length > 0) {
      await db.insert(tags).values(
        filteredTags.map((t) => ({
          toolId,
          tagKey: t.key,
          tagValue: t.value,
        }))
      );
    }
  }

  // Refresh GitHub data if repo URL changed or explicitly requested
  const effectiveRepoUrl = updateData.repoUrl !== undefined ? updateData.repoUrl : tool.repoUrl;
  if (body.refreshGithub || (updateData.repoUrl !== undefined && updateData.repoUrl !== tool.repoUrl)) {
    if (effectiveRepoUrl) {
      const parsed = parseGitHubRepoUrl(effectiveRepoUrl);
      if (parsed) {
        const ctx = locals.runtime.ctx;
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
                  .where(eq(tools.id, toolId));
              }
            })
            .catch(() => {})
        );
      }
    } else {
      // Clear GitHub data if repo URL removed
      await db
        .update(tools)
        .set({
          githubStars: null,
          githubForks: null,
          githubLicense: null,
          githubLanguage: null,
          githubUpdatedAt: null,
          githubFetchedAt: null,
        })
        .where(eq(tools.id, toolId));
    }
  }

  return api.success({ toolId });
};

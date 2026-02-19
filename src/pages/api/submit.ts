import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, tags } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { urlToSlug, hashIp, getClientIp } from '../../lib/utils';
import { api } from '../../lib/api';
import { archiveUrl } from '../../lib/archive';
import { TAG_DEFINITIONS } from '../../lib/tags';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals.runtime.env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { name, url, description, pledge, coreTask, tags: submittedTags } = body;

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

  // Rate limiting: max 3 submissions per IP per day
  const clientIp = getClientIp(request);
  const ipHash = await hashIp(clientIp);
  const oneDayAgo = new Date(Date.now() - 86400000);

  const recentSubmissions = await db
    .select({ id: tools.id })
    .from(tools)
    .where(
      and(
        eq(tools.submitterIpHash, ipHash),
        sql`${tools.submittedAt} > ${Math.floor(oneDayAgo.getTime() / 1000)}`
      )
    );

  if (recentSubmissions.length >= 3) {
    return api.error(
      'You have reached the daily submission limit (3 per day). Please try again tomorrow.',
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

  // Archive URL asynchronously (fire and forget)
  const env = locals.runtime.env;
  if (env.ARCHIVE_ORG_ACCESS_KEY && env.ARCHIVE_ORG_SECRET_KEY) {
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
      });
  }

  return api.success({ slug: inserted.slug }, 201);
};

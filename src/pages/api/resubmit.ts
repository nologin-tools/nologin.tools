export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, healthChecks } from '../../db/schema';
import { eq, and, ne, sql } from 'drizzle-orm';
import { urlToSlug, hashIp, getClientIp, isValidSlug } from '../../lib/utils';
import { api } from '../../lib/api';
import { archiveUrl } from '../../lib/archive';
import { checkHealth } from '../../lib/health';

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals.runtime.env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { toolId, url, submitterEmail } = body || {};

  // Validate toolId
  if (!toolId || typeof toolId !== 'number') {
    return api.error('Tool ID is required.', 400);
  }

  // Fetch the tool and verify it's rejected
  const [tool] = await db
    .select({
      id: tools.id,
      slug: tools.slug,
      url: tools.url,
      status: tools.status,
      submitterEmail: tools.submitterEmail,
    })
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

  const cleanUrl = typeof url === 'string' && url.trim() ? url.trim() : tool.url;
  try {
    const parsed = new URL(cleanUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.url = 'Only HTTP and HTTPS URLs are supported.';
    }
  } catch {
    errors.url = 'Please enter a valid URL.';
  }

  if (submitterEmail != null && submitterEmail !== '') {
    if (
      typeof submitterEmail !== 'string' ||
      submitterEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail.trim())
    ) {
      errors.submitterEmail = 'Please enter a valid email address.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return api.error('Validation failed.', 400, errors);
  }

  // Recompute slug if URL changed
  const newSlug = urlToSlug(cleanUrl);
  if (!isValidSlug(newSlug)) {
    return api.error('Unable to generate a valid slug from URL.', 400, {
      url: 'The URL does not yield a valid tool slug.',
    });
  }

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

  // Rate limiting (IP based)
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

  // Update tool to pending
  const now = new Date();
  const finalEmail =
    submitterEmail && typeof submitterEmail === 'string' && submitterEmail.trim()
      ? submitterEmail.trim()
      : tool.submitterEmail;

  await db
    .update(tools)
    .set({
      slug: newSlug,
      url: cleanUrl,
      status: 'pending',
      rejectionReason: null,
      submittedAt: now,
      submitterIpHash: ipHash,
      submitterEmail: finalEmail,
    })
    .where(eq(tools.id, toolId));

  // Archive URL asynchronously (fire and forget via waitUntil)
  const env = locals.runtime.env;
  const ctx = locals.runtime.ctx;
  if (env.ARCHIVE_ORG_ACCESS_KEY && env.ARCHIVE_ORG_SECRET_KEY) {
    ctx.waitUntil(
      archiveUrl(cleanUrl, env.ARCHIVE_ORG_ACCESS_KEY, env.ARCHIVE_ORG_SECRET_KEY)
        .then(async (archiveUrlResult) => {
          if (archiveUrlResult) {
            await db
              .update(tools)
              .set({ archiveUrl: archiveUrlResult })
              .where(eq(tools.id, toolId));
          }
        })
        .catch(() => {})
    );
  }

  // Health check asynchronously (fire and forget via waitUntil)
  ctx.waitUntil(
    checkHealth(cleanUrl, env.SITE_URL)
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

  return api.success({ slug: newSlug });
};

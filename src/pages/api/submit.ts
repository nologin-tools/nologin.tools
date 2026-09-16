export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, healthChecks } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { urlToSlug, hashIp, getClientIp, isValidSlug } from '../../lib/utils';
import { api } from '../../lib/api';
import { archiveUrl } from '../../lib/archive';
import { checkHealth } from '../../lib/health';

function deriveDefaultName(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.replace(/^www\./, '');
    const parts = host.split('.');
    let brand = parts[0];
    if (['app', 'web', 'tool', 'tools', 'beta', 'dev'].includes(brand.toLowerCase()) && parts.length > 2) {
      brand = parts[1];
    }
    if (brand && brand.length >= 2) {
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
    return host;
  } catch {
    return 'Tool';
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals.runtime.env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { url, submitterEmail } = body || {};

  // Validation: Only URL is strictly required
  const errors: Record<string, string> = {};

  if (!url || typeof url !== 'string' || !url.trim()) {
    errors.url = 'A valid URL is required.';
  } else {
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        errors.url = 'Only HTTP and HTTPS URLs are supported.';
      }
    } catch {
      errors.url = 'Please enter a valid URL.';
    }
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

  const cleanUrl = url.trim();

  // Generate slug
  const slug = urlToSlug(cleanUrl);
  if (!isValidSlug(slug)) {
    return api.error('Unable to generate a valid slug from URL.', 400, {
      url: 'The URL does not yield a valid tool slug.',
    });
  }

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

  // Insert tool with auto-derived name and pending defaults
  const now = new Date();
  const derivedName = deriveDefaultName(cleanUrl);

  const [inserted] = await db
    .insert(tools)
    .values({
      slug,
      name: derivedName,
      url: cleanUrl,
      description: null,
      coreTask: 'Pending review',
      noLoginPledge: true,
      status: 'pending',
      submittedAt: now,
      submitterIpHash: ipHash,
      submitterEmail:
        submitterEmail && typeof submitterEmail === 'string' && submitterEmail.trim()
          ? submitterEmail.trim()
          : null,
    })
    .returning({ id: tools.id, slug: tools.slug });

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
    checkHealth(cleanUrl, env.SITE_URL)
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

  return api.success({ slug: inserted.slug }, 201);
};

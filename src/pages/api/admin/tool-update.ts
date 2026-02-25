export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { tools, tags } from '../../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { urlToSlug } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { TAG_DEFINITIONS } from '../../../lib/tags';

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
        const def = TAG_DEFINITIONS.find((d) => d.key === tag.key);
        if (def && def.values.includes(tag.value)) {
          validTags.push({ key: tag.key, value: tag.value });
        }
      }
    }

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
  }

  return api.success({ toolId });
};

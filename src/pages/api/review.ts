export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, tags, editSuggestions } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { api } from '../../lib/api';
import { urlToSlug } from '../../lib/utils';
import { TAG_DEFINITIONS } from '../../lib/tags';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const db = getDb(env.DB);

  let body: any;
  try {
    body = await request.json();
  } catch {
    return api.error('Invalid JSON body.', 400);
  }

  const { secret, action } = body;

  // Verify admin secret
  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return api.error('Unauthorized.', 401);
  }

  if (action === 'approve') {
    const { toolId } = body;
    if (!toolId) return api.error('toolId is required.', 400);

    await db
      .update(tools)
      .set({
        status: 'approved',
        approvedAt: new Date(),
      })
      .where(eq(tools.id, toolId));

    return api.success({ toolId, status: 'approved' });
  }

  if (action === 'reject') {
    const { toolId, reason } = body;
    if (!toolId) return api.error('toolId is required.', 400);

    await db
      .update(tools)
      .set({
        status: 'rejected',
        rejectionReason: reason || null,
        isFeatured: false,
        featuredAt: null,
      })
      .where(eq(tools.id, toolId));

    return api.success({ toolId, status: 'rejected' });
  }

  if (action === 'approve_edit') {
    const { editId } = body;
    if (!editId) return api.error('editId is required.', 400);

    // Get the edit suggestion
    const [edit] = await db
      .select()
      .from(editSuggestions)
      .where(eq(editSuggestions.id, editId))
      .limit(1);

    if (!edit) return api.error('Edit suggestion not found.', 404);

    // Apply the edit to the tool
    const allowedFields = ['name', 'description', 'coreTask', 'url', 'tags'] as const;
    type AllowedField = (typeof allowedFields)[number];

    if (!allowedFields.includes(edit.fieldName as AllowedField)) {
      return api.error('Invalid field for editing.', 400);
    }

    if (edit.fieldName === 'tags') {
      // Parse and validate tags JSON
      let tagEntries: { key: string; value: string }[];
      try {
        tagEntries = JSON.parse(edit.newValue);
        if (!Array.isArray(tagEntries)) throw new Error('Not an array');
      } catch {
        return api.error('Invalid tags data.', 400);
      }

      const validTags: { key: string; value: string }[] = [];
      for (const tag of tagEntries) {
        if (tag.key && tag.value) {
          const def = TAG_DEFINITIONS.find((d) => d.key === tag.key);
          if (def && def.values.includes(tag.value)) {
            validTags.push({ key: tag.key, value: tag.value });
          }
        }
      }

      // Delete old tags and insert new ones
      await db.delete(tags).where(eq(tags.toolId, edit.toolId));
      if (validTags.length > 0) {
        await db.insert(tags).values(
          validTags.map((t) => ({
            toolId: edit.toolId,
            tagKey: t.key,
            tagValue: t.value,
          }))
        );
      }
    } else if (edit.fieldName === 'url') {
      // URL change requires slug update + uniqueness check
      const newUrl = edit.newValue.trim();
      try { new URL(newUrl); } catch {
        return api.error('Invalid URL.', 400);
      }
      const newSlug = urlToSlug(newUrl);
      const [existing] = await db
        .select({ id: tools.id })
        .from(tools)
        .where(and(eq(tools.slug, newSlug), ne(tools.id, edit.toolId)))
        .limit(1);
      if (existing) {
        return api.error('A tool with this URL already exists.', 400);
      }
      await db
        .update(tools)
        .set({ url: newUrl, slug: newSlug })
        .where(eq(tools.id, edit.toolId));
    } else {
      const updateData: Record<string, string> = {};
      updateData[edit.fieldName] = edit.newValue;
      await db
        .update(tools)
        .set(updateData)
        .where(eq(tools.id, edit.toolId));
    }

    // Mark edit as approved
    await db
      .update(editSuggestions)
      .set({ status: 'approved' })
      .where(eq(editSuggestions.id, editId));

    return api.success({ editId, status: 'approved' });
  }

  if (action === 'reject_edit') {
    const { editId } = body;
    if (!editId) return api.error('editId is required.', 400);

    await db
      .update(editSuggestions)
      .set({ status: 'rejected' })
      .where(eq(editSuggestions.id, editId));

    return api.success({ editId, status: 'rejected' });
  }

  return api.error('Invalid action.', 400);
};

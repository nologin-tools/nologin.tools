import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, editSuggestions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { api } from '../../lib/api';

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

    // Apply the edit to the tool (only allow whitelisted fields)
    const allowedFields = ['name', 'description', 'coreTask', 'url'] as const;
    type AllowedField = (typeof allowedFields)[number];

    if (!allowedFields.includes(edit.fieldName as AllowedField)) {
      return api.error('Invalid field for editing.', 400);
    }

    const updateData: Record<string, string> = {};
    updateData[edit.fieldName] = edit.newValue;
    await db
      .update(tools)
      .set(updateData)
      .where(eq(tools.id, edit.toolId));

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

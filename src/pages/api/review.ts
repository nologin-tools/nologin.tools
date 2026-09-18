export const prerender = false;

import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { tools, editSuggestions } from '../../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { api } from '../../lib/api';
import { urlToSlug } from '../../lib/utils';
import { TAG_DEFINITIONS } from '../../lib/tags';
import { validateDiscordUrl, validateGitHubProfileUrl, validateRepoUrl, validateTwitterUrl } from '../../lib/github';

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
    return api.error('Use approve_evaluated so metadata, taxonomy, and approval are committed atomically.', 400);
  }

  if (action === 'approve_evaluated') {
    const { toolId, metadata, tags: requestedTags } = body;
    if (!toolId || typeof toolId !== 'number') return api.error('toolId is required.', 400);
    if (!metadata || typeof metadata !== 'object') return api.error('metadata is required.', 400);

    const [tool] = await db
      .select({ id: tools.id, status: tools.status })
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1);
    if (!tool) return api.error('Tool not found.', 404);
    if (tool.status !== 'pending') return api.error('Only pending tools can be approved through evaluated ingestion.', 409);

    const name = String(metadata.name || '').trim();
    const description = String(metadata.description || '').trim();
    const coreTask = String(metadata.coreTask || '').trim();
    const repoUrl = metadata.repoUrl ? String(metadata.repoUrl).trim() : null;
    const errors: Record<string, string> = {};
    if (name.length < 2 || name.length > 100) errors.name = 'Name must be between 2 and 100 characters.';
    if (!description || description.length > 500) errors.description = 'Description is required and must be max 500 characters.';
    if (!coreTask || coreTask.length > 200) errors.coreTask = 'Core task is required and must be max 200 characters.';
    if (repoUrl && !validateRepoUrl(repoUrl)) errors.repoUrl = 'repoUrl must be a valid GitHub repository URL.';
    if (!Array.isArray(requestedTags)) errors.tags = 'tags must be an array.';

    const validTags: { key: string; value: string }[] = [];
    if (Array.isArray(requestedTags)) {
      for (const tag of requestedTags) {
        if (!tag?.key || !tag?.value || tag.key === 'source') continue;
        const definition = TAG_DEFINITIONS.find((item) => item.key === tag.key);
        if (!definition || !definition.values.includes(tag.value)) {
          errors.tags = `Invalid tag: ${String(tag.key)}:${String(tag.value)}`;
          break;
        }
        if (!validTags.some(existing => existing.key === tag.key && existing.value === tag.value)) {
          validTags.push({ key: tag.key, value: tag.value });
        }
      }
    }
    for (const definition of TAG_DEFINITIONS) {
      const count = validTags.filter(tag => tag.key === definition.key).length;
      if (count === 0 || (!definition.multiSelect && count !== 1)) {
        errors.tags = definition.multiSelect
          ? `At least one ${definition.key} tag is required.`
          : `Exactly one ${definition.key} tag is required.`;
        break;
      }
    }
    if (repoUrl) validTags.push({ key: 'source', value: 'Open Source' });
    if (Object.keys(errors).length > 0) return api.error('Validation failed.', 400, errors);

    const pendingExistsSql = `EXISTS (SELECT 1 FROM tools WHERE id = ? AND status = 'pending')`;
    const statements = [
      env.DB.prepare(
        `UPDATE tools SET name = ?, description = ?, core_task = ?, repo_url = ?, rejection_reason = NULL
         WHERE id = ? AND status = 'pending'`
      ).bind(name, description, coreTask, repoUrl, toolId),
      env.DB.prepare(`DELETE FROM tags WHERE tool_id = ? AND ${pendingExistsSql}`).bind(toolId, toolId),
      ...validTags.map(tag =>
        env.DB.prepare(
          `INSERT INTO tags (tool_id, tag_key, tag_value)
           SELECT ?, ?, ? WHERE ${pendingExistsSql}`
        ).bind(toolId, tag.key, tag.value, toolId)
      ),
      env.DB.prepare(
        `UPDATE tools SET status = 'approved', approved_at = unixepoch(), rejection_reason = NULL
         WHERE id = ? AND status = 'pending'`
      ).bind(toolId),
    ];
    const results = await env.DB.batch(statements);
    if (results.some(result => !result.success) || Number(results.at(-1)?.meta?.changes || 0) !== 1) {
      return api.error('Atomic approval did not complete.', 409);
    }

    return api.success({ toolId, status: 'approved', tags: validTags.length });
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
    const allowedFields = [
      'name',
      'description',
      'coreTask',
      'url',
      'tags',
      'repoUrl',
      'twitterUrl',
      'githubUrl',
      'discordUrl',
    ] as const;
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
          if (def && def.values.includes(tag.value) && !validTags.some(existing => existing.key === tag.key && existing.value === tag.value)) {
            validTags.push({ key: tag.key, value: tag.value });
          }
        }
      }

      for (const definition of TAG_DEFINITIONS) {
        const count = validTags.filter(tag => tag.key === definition.key).length;
        if (count === 0 || (!definition.multiSelect && count !== 1)) {
          return api.error(
            definition.multiSelect
              ? `At least one ${definition.key} tag is required.`
              : `Exactly one ${definition.key} tag is required.`,
            400
          );
        }
      }

      const [editedTool] = await db
        .select({ repoUrl: tools.repoUrl })
        .from(tools)
        .where(eq(tools.id, edit.toolId))
        .limit(1);
      if (!editedTool) return api.error('Tool not found.', 404);
      if (editedTool.repoUrl) validTags.push({ key: 'source', value: 'Open Source' });

      const pendingEditExistsSql = `EXISTS (SELECT 1 FROM edit_suggestions WHERE id = ? AND status = 'pending')`;
      const results = await env.DB.batch([
        env.DB.prepare(`DELETE FROM tags WHERE tool_id = ? AND ${pendingEditExistsSql}`).bind(edit.toolId, editId),
        ...validTags.map(tag =>
          env.DB.prepare(
            `INSERT INTO tags (tool_id, tag_key, tag_value)
             SELECT ?, ?, ? WHERE ${pendingEditExistsSql}`
          ).bind(edit.toolId, tag.key, tag.value, editId)
        ),
        env.DB.prepare(`UPDATE edit_suggestions SET status = 'approved' WHERE id = ? AND status = 'pending'`).bind(editId),
      ]);
      if (results.some(result => !result.success) || Number(results.at(-1)?.meta?.changes || 0) !== 1) {
        return api.error('Atomic edit approval did not complete.', 409);
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
      const results = await env.DB.batch([
        env.DB.prepare(
          `UPDATE tools SET url = ?, slug = ?
           WHERE id = ? AND EXISTS (SELECT 1 FROM edit_suggestions WHERE id = ? AND status = 'pending')`
        ).bind(newUrl, newSlug, edit.toolId, editId),
        env.DB.prepare(`UPDATE edit_suggestions SET status = 'approved' WHERE id = ? AND status = 'pending'`).bind(editId),
      ]);
      if (results.some(result => !result.success) || Number(results.at(-1)?.meta?.changes || 0) !== 1) {
        return api.error('Atomic edit approval did not complete.', 409);
      }
    } else {
      const columnByField = {
        name: 'name',
        description: 'description',
        coreTask: 'core_task',
        repoUrl: 'repo_url',
        twitterUrl: 'twitter_url',
        githubUrl: 'github_url',
        discordUrl: 'discord_url',
      } as const;
      const column = columnByField[edit.fieldName as keyof typeof columnByField];
      if (!column) return api.error('Invalid field for editing.', 400);

      const value = edit.newValue.trim();
      if (edit.fieldName === 'name' && (value.length < 2 || value.length > 100)) {
        return api.error('Name must be between 2 and 100 characters.', 400);
      }
      if (edit.fieldName === 'description' && (!value || value.length > 500)) {
        return api.error('Description is required and must be max 500 characters.', 400);
      }
      if (edit.fieldName === 'coreTask' && (!value || value.length > 200)) {
        return api.error('Core task is required and must be max 200 characters.', 400);
      }
      if (edit.fieldName === 'repoUrl' && !validateRepoUrl(value)) {
        return api.error('Invalid GitHub repository URL.', 400);
      }
      if (edit.fieldName === 'twitterUrl' && !validateTwitterUrl(value)) {
        return api.error('Invalid Twitter/X URL.', 400);
      }
      if (edit.fieldName === 'githubUrl' && !validateGitHubProfileUrl(value)) {
        return api.error('Invalid GitHub profile URL.', 400);
      }
      if (edit.fieldName === 'discordUrl' && !validateDiscordUrl(value)) {
        return api.error('Invalid Discord URL.', 400);
      }

      const pendingEditExistsSql = `EXISTS (SELECT 1 FROM edit_suggestions WHERE id = ? AND status = 'pending')`;
      const statements = [
        env.DB.prepare(
          `UPDATE tools SET ${column} = ?
           WHERE id = ? AND EXISTS (SELECT 1 FROM edit_suggestions WHERE id = ? AND status = 'pending')`
        ).bind(value, edit.toolId, editId),
      ];
      if (edit.fieldName === 'repoUrl') {
        statements.push(
          env.DB.prepare(`DELETE FROM tags WHERE tool_id = ? AND tag_key = 'source' AND ${pendingEditExistsSql}`).bind(edit.toolId, editId),
          env.DB.prepare(
            `INSERT INTO tags (tool_id, tag_key, tag_value)
             SELECT ?, 'source', 'Open Source' WHERE ${pendingEditExistsSql}`
          ).bind(edit.toolId, editId)
        );
      }
      statements.push(
        env.DB.prepare(`UPDATE edit_suggestions SET status = 'approved' WHERE id = ? AND status = 'pending'`).bind(editId)
      );

      const results = await env.DB.batch(statements);
      if (results.some(result => !result.success) || Number(results.at(-1)?.meta?.changes || 0) !== 1) {
        return api.error('Atomic edit approval did not complete.', 409);
      }
    }

    // Tags, URL, and scalar edit branches mark the suggestion approved in the same D1 batch.

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

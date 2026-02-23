import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const tools = sqliteTable('tools', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  coreTask: text('core_task').notNull(),
  noLoginPledge: integer('no_login_pledge', { mode: 'boolean' })
    .notNull()
    .default(false),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull(),
  approvedAt: integer('approved_at', { mode: 'timestamp' }),
  rejectionReason: text('rejection_reason'),
  submitterIpHash: text('submitter_ip_hash'),
  submitterEmail: text('submitter_email'),
  archiveUrl: text('archive_url'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).notNull().default(false),
  featuredAt: integer('featured_at', { mode: 'timestamp' }),
}, (table) => [
  index('idx_tools_status').on(table.status),
]);

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id')
    .notNull()
    .references(() => tools.id, { onDelete: 'cascade' }),
  tagKey: text('tag_key').notNull(),
  tagValue: text('tag_value').notNull(),
}, (table) => [
  index('idx_tags_tool_id').on(table.toolId),
]);

export const healthChecks = sqliteTable('health_checks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id')
    .notNull()
    .references(() => tools.id, { onDelete: 'cascade' }),
  checkedAt: integer('checked_at', { mode: 'timestamp' }).notNull(),
  isOnline: integer('is_online', { mode: 'boolean' }).notNull(),
  httpStatus: integer('http_status'),
  responseTimeMs: integer('response_time_ms'),
}, (table) => [
  index('idx_health_checks_tool_id_checked_at').on(table.toolId, table.checkedAt),
]);

export const badgeDisplays = sqliteTable('badge_displays', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id')
    .notNull()
    .references(() => tools.id, { onDelete: 'cascade' })
    .unique(),
  displayType: text('display_type', {
    enum: ['explicit', 'implicit', 'none'],
  })
    .notNull()
    .default('none'),
  lastCheckedAt: integer('last_checked_at', { mode: 'timestamp' }),
});

export const editSuggestions = sqliteTable('edit_suggestions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  toolId: integer('tool_id')
    .notNull()
    .references(() => tools.id, { onDelete: 'cascade' }),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value').notNull(),
  reason: text('reason'),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .notNull()
    .default('pending'),
  submittedAt: integer('submitted_at', { mode: 'timestamp' }).notNull(),
  submitterIpHash: text('submitter_ip_hash'),
});

export const dataExports = sqliteTable('data_exports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exportedAt: integer('exported_at', { mode: 'timestamp' }).notNull(),
  toolCount: integer('tool_count').notNull(),
  filesUpdated: text('files_updated'),
  triggerSource: text('trigger_source', { enum: ['manual', 'cron'] }).notNull(),
  status: text('status', { enum: ['success', 'error'] }).notNull(),
  errorMessage: text('error_message'),
});

CREATE INDEX `idx_health_checks_tool_id_checked_at` ON `health_checks` (`tool_id`,`checked_at`);--> statement-breakpoint
CREATE INDEX `idx_tags_tool_id` ON `tags` (`tool_id`);--> statement-breakpoint
CREATE INDEX `idx_tools_status` ON `tools` (`status`);
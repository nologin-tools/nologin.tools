CREATE TABLE `data_exports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exported_at` integer NOT NULL,
	`tool_count` integer NOT NULL,
	`files_updated` text,
	`trigger_source` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text
);

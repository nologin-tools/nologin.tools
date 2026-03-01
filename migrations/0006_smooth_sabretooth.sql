CREATE TABLE `github_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` integer NOT NULL,
	`issue_url` text,
	`issue_number` integer,
	`created_at` integer NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`error_message` text,
	FOREIGN KEY (`tool_id`) REFERENCES `tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `github_notifications_tool_id_unique` ON `github_notifications` (`tool_id`);
-- Migration: rename content → trigger/summary/prd_data_snapshot
-- SQLite ALTER TABLE can't drop columns or rename, so we recreate the table
-- Step 1: Rename old table
ALTER TABLE `project_versions` RENAME TO `project_versions_old`;
--> statement-breakpoint
-- Step 2: Create new table with new schema
CREATE TABLE `project_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version` integer NOT NULL,
	`trigger` text NOT NULL DEFAULT 'manual',
	`summary` text NOT NULL,
	`prd_data_snapshot` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
-- Step 3: Migrate existing data (content → summary)
INSERT INTO `project_versions` (`id`, `project_id`, `version`, `trigger`, `summary`, `created_at`)
SELECT `id`, `project_id`, `version`, 'manual', 'Manual save', `created_at`
FROM `project_versions_old`;
--> statement-breakpoint
-- Step 4: Drop old table
DROP TABLE `project_versions_old`;

CREATE TABLE `registration_leaderboard_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lc` varchar(64) NOT NULL,
	`email_hash` varchar(64) NOT NULL,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `registration_leaderboard_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `registration_leaderboard_entries_email_hash_unique` UNIQUE(`email_hash`)
);

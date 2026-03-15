CREATE TABLE `user_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`isAdmin` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_accounts_username_unique` UNIQUE(`username`),
	CONSTRAINT `user_accounts_email_unique` UNIQUE(`email`)
);

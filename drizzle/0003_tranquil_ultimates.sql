CREATE TABLE `adminAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `adminAccounts_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `userDataStorage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dataType` varchar(50) NOT NULL,
	`data` longtext NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userDataStorage_id` PRIMARY KEY(`id`)
);

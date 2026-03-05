CREATE TABLE `customCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`icon` varchar(50) DEFAULT 'tag',
	`color` varchar(7) DEFAULT '#6B7280',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customCategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lectures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`color` varchar(7) DEFAULT '#3B82F6',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lectures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `lectureRecordings` ADD `lectureId` int;
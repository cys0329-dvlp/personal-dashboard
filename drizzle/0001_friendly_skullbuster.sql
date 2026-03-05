CREATE TABLE `lectureRecordings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`subject` varchar(255),
	`description` text,
	`audioUrl` text NOT NULL,
	`audioFileKey` text NOT NULL,
	`duration` int,
	`recordedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lectureRecordings_id` PRIMARY KEY(`id`)
);

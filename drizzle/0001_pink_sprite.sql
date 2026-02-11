CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`opportunityId` int NOT NULL,
	`type` enum('llamada','email','reunion','nota','propuesta') NOT NULL,
	`title` varchar(255) NOT NULL,
	`notes` text,
	`result` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`companyType` varchar(100) NOT NULL,
	`status` enum('contactado','en_progreso','cerrado','perdido') NOT NULL DEFAULT 'contactado',
	`opportunityScore` int NOT NULL,
	`strategyId` varchar(255),
	`contactDate` timestamp,
	`lastActivityDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opportunities_id` PRIMARY KEY(`id`)
);

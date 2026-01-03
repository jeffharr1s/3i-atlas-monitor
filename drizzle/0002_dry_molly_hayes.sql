CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enableToastNotifications` boolean DEFAULT true,
	`enableNotificationCenter` boolean DEFAULT true,
	`toastDuration` int DEFAULT 5000,
	`enableNewArticles` boolean DEFAULT true,
	`enableAlerts` boolean DEFAULT true,
	`enableContradictions` boolean DEFAULT true,
	`enableSourceUpdates` boolean DEFAULT true,
	`filterByCategory` text,
	`filterBySeverity` text,
	`doNotDisturbEnabled` boolean DEFAULT false,
	`doNotDisturbStart` varchar(5),
	`doNotDisturbEnd` varchar(5),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notificationPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('info','success','warning','error','article_new','alert_triggered','contradiction_found','source_update') DEFAULT 'info',
	`category` enum('trajectory','composition','activity','government_statement','scientific_discovery','speculation','debunking','international_perspective','other'),
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`sourceId` int,
	`articleId` int,
	`isRead` boolean DEFAULT false,
	`isDismissed` boolean DEFAULT false,
	`actionUrl` varchar(500),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `doNotDisturbMode` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `doNotDisturbStart` varchar(5);--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `doNotDisturbEnd` varchar(5);
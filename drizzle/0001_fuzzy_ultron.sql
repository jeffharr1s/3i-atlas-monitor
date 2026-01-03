CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int,
	`alertType` enum('major_discovery','trajectory_change','composition_update','government_statement','contradiction_detected','significant_change','verification_update') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('low','medium','high','critical') DEFAULT 'medium',
	`isNotified` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analysisResults` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`analysisType` enum('claim_extraction','cross_reference','contradiction_detection','credibility_assessment','summary_generation') NOT NULL,
	`result` json,
	`confidence` decimal(3,2) DEFAULT '0.50',
	`relatedArticleIds` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisResults_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text,
	`summary` text,
	`url` varchar(500) NOT NULL,
	`publishedAt` timestamp,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	`category` enum('trajectory','composition','activity','government_statement','scientific_discovery','speculation','debunking','international_perspective','timeline_event','other') DEFAULT 'other',
	`credibilityScore` decimal(3,2) DEFAULT '0.50',
	`isAnalyzed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_url_unique` UNIQUE(`url`)
);
--> statement-breakpoint
CREATE TABLE `claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`articleId` int NOT NULL,
	`claimText` text NOT NULL,
	`claimType` enum('trajectory','composition','activity','danger','origin','observation','speculation','other') NOT NULL,
	`confidence` decimal(3,2) DEFAULT '0.50',
	`isVerified` boolean DEFAULT false,
	`verificationStatus` enum('unverified','supported','contradicted','debunked','inconclusive') DEFAULT 'unverified',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `claims_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contradictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`claimId1` int NOT NULL,
	`claimId2` int NOT NULL,
	`contradictionLevel` enum('minor','moderate','major','critical') NOT NULL,
	`description` text,
	`resolutionStatus` enum('unresolved','resolved','inconclusive') DEFAULT 'unresolved',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contradictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` varchar(500) NOT NULL,
	`sourceType` enum('official_agency','peer_reviewed','news_outlet','scientific_blog','social_media','skeptic_analysis','government','other') NOT NULL,
	`country` varchar(100),
	`credibilityScore` decimal(3,2) DEFAULT '0.50',
	`description` text,
	`rssUrl` varchar(500),
	`apiUrl` varchar(500),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`enableAlerts` boolean DEFAULT true,
	`alertTypes` text,
	`preferredCategories` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`)
);

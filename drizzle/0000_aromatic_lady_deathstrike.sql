CREATE TABLE `rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomCode` varchar(6) NOT NULL,
	`status` enum('waiting','setup','secret_selection','playing','finished','expired') NOT NULL DEFAULT 'waiting',
	`settings` json NOT NULL,
	`deckIds` json NOT NULL,
	`deckSeed` varchar(64) NOT NULL,
	`activeSeat` int,
	`winnerSeat` int,
	`winReason` enum('guess','hearts'),
	`feedback` varchar(255),
	`player1Score` int NOT NULL DEFAULT 0,
	`player2Score` int NOT NULL DEFAULT 0,
	`revision` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `rooms_room_code_unique` UNIQUE(`roomCode`)
);
--> statement-breakpoint
CREATE TABLE `seat_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`roomId` int NOT NULL,
	`seatNumber` int NOT NULL,
	`tabId` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `seat_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `seat_tokens_hash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `seats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roomId` int NOT NULL,
	`seatNumber` int NOT NULL,
	`playerName` varchar(32) NOT NULL,
	`secretCardId` int,
	`eliminatedIds` json NOT NULL,
	`hearts` int,
	`ready` boolean NOT NULL DEFAULT false,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seats_id` PRIMARY KEY(`id`),
	CONSTRAINT `seats_room_seat_unique` UNIQUE(`roomId`,`seatNumber`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `rooms_status_activity_idx` ON `rooms` (`status`,`lastActivityAt`);--> statement-breakpoint
CREATE INDEX `seat_tokens_room_seat_idx` ON `seat_tokens` (`roomId`,`seatNumber`);--> statement-breakpoint
CREATE INDEX `seats_room_idx` ON `seats` (`roomId`);
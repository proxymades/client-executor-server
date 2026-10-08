-- CreateTable
CREATE TABLE `FeedbackClient` (
    `id` VARCHAR(191) NOT NULL,
    `whoUser` VARCHAR(20) NOT NULL,
    `toUser` VARCHAR(20) NOT NULL,
    `rating` INTEGER NOT NULL,
    `message` VARCHAR(200) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClientNotificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `token` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExecutorNotificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `token` VARCHAR(300) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeedbackClient` ADD CONSTRAINT `FeedbackClient_toUser_fkey` FOREIGN KEY (`toUser`) REFERENCES `Client`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackClient` ADD CONSTRAINT `FeedbackClient_whoUser_fkey` FOREIGN KEY (`whoUser`) REFERENCES `Executor`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackClient` ADD CONSTRAINT `FeedbackClient_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClientNotificationToken` ADD CONSTRAINT `ClientNotificationToken_phone_fkey` FOREIGN KEY (`phone`) REFERENCES `Client`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExecutorNotificationToken` ADD CONSTRAINT `ExecutorNotificationToken_phone_fkey` FOREIGN KEY (`phone`) REFERENCES `Executor`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

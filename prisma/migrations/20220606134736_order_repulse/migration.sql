-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `finished` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `FeedbackExecutor` (
    `id` VARCHAR(191) NOT NULL,
    `whoUser` VARCHAR(20) NOT NULL,
    `toUser` VARCHAR(20) NOT NULL,
    `rating` INTEGER NOT NULL,
    `message` VARCHAR(200) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FeedbackExecutor` ADD CONSTRAINT `FeedbackExecutor_whoUser_fkey` FOREIGN KEY (`whoUser`) REFERENCES `Client`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackExecutor` ADD CONSTRAINT `FeedbackExecutor_toUser_fkey` FOREIGN KEY (`toUser`) REFERENCES `Executor`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedbackExecutor` ADD CONSTRAINT `FeedbackExecutor_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

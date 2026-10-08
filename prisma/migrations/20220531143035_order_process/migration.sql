-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `header` VARCHAR(30) NOT NULL,
    `category` VARCHAR(90) NOT NULL,
    `count` VARCHAR(10) NOT NULL,
    `text` VARCHAR(200) NOT NULL,
    `city` VARCHAR(90) NOT NULL,
    `urgent` BOOLEAN NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `creator` VARCHAR(20) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isWork` BOOLEAN NOT NULL DEFAULT false,
    `isReady` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Order_city_idx`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_creator_fkey` FOREIGN KEY (`creator`) REFERENCES `Client`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

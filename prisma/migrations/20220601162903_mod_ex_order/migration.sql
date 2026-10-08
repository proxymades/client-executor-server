-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_worker_fkey`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_worker_fkey` FOREIGN KEY (`worker`) REFERENCES `Executor`(`phone`) ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - Added the required column `worker` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `worker` VARCHAR(20) NOT NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_worker_fkey` FOREIGN KEY (`worker`) REFERENCES `Executor`(`phone`) ON DELETE CASCADE ON UPDATE CASCADE;

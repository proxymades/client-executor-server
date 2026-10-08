/*
  Warnings:

  - You are about to drop the column `worker` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_worker_fkey`;

-- AlterTable
ALTER TABLE `Order` DROP COLUMN `worker`;

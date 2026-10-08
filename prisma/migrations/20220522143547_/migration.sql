/*
  Warnings:

  - You are about to drop the column `regDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `regPhone` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `User_regPhone_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `regDate`,
    DROP COLUMN `regPhone`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `phone` VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_phone_key` ON `User`(`phone`);

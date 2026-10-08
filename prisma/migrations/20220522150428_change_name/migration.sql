/*
  Warnings:

  - You are about to drop the column `fullName` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Executor` table. All the data in the column will be lost.
  - Added the required column `name` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Executor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` DROP COLUMN `fullName`,
    ADD COLUMN `name` VARCHAR(90) NOT NULL;

-- AlterTable
ALTER TABLE `Executor` DROP COLUMN `companyName`,
    ADD COLUMN `name` VARCHAR(90) NOT NULL;

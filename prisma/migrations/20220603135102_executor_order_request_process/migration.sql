/*
  Warnings:

  - Added the required column `offer` to the `OrderRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `OrderRequest` ADD COLUMN `offer` VARCHAR(10) NOT NULL;

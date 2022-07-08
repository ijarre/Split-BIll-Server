/*
  Warnings:

  - Added the required column `slug` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "slug" TEXT NOT NULL;

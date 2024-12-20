/*
  Warnings:

  - You are about to drop the column `name` on the `budget_category` table. All the data in the column will be lost.
  - You are about to drop the column `normalized Name` on the `budget_category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "budget_category_budget_id_normalized Name_key";

-- AlterTable
ALTER TABLE "budget_category" DROP COLUMN "name",
DROP COLUMN "normalized Name";

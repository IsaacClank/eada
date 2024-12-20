/*
  Warnings:

  - You are about to drop the column `tagId` on the `budget_category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tag_id]` on the table `budget_category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tag_id` to the `budget_category` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "budget_category" DROP CONSTRAINT "budget_category_tagId_fkey";

-- DropIndex
DROP INDEX "budget_category_tagId_key";

-- AlterTable
ALTER TABLE "budget_category" DROP COLUMN "tagId",
ADD COLUMN     "tag_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "budget_category_tag_id_key" ON "budget_category"("tag_id");

-- AddForeignKey
ALTER TABLE "budget_category" ADD CONSTRAINT "budget_category_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "created_by" INTEGER,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

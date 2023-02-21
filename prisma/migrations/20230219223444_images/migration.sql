/*
  Warnings:

  - You are about to drop the column `image` on the `productGallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "productGallery" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[];

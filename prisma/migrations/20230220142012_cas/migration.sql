-- DropForeignKey
ALTER TABLE "productGallery" DROP CONSTRAINT "productGallery_product_id_fkey";

-- AddForeignKey
ALTER TABLE "productGallery" ADD CONSTRAINT "productGallery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "product_title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_gallery" TEXT NOT NULL,
    "product_qty" INTEGER NOT NULL,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "discount_price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "specification" TEXT NOT NULL,
    "verfied" BOOLEAN NOT NULL,
    "category_id" INTEGER NOT NULL,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productGallery" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productGallery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productGallery" ADD CONSTRAINT "productGallery_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_super_user" BOOLEAN NOT NULL DEFAULT false;

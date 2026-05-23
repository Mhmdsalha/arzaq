-- CreateEnum
CREATE TYPE "public"."AccountType" AS ENUM ('CLIENT', 'PROVIDER');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN "accountType" "public"."AccountType" NOT NULL DEFAULT 'CLIENT';

-- AlterTable
ALTER TABLE "public"."Profile" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;

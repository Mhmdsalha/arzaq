CREATE TYPE "StorePlanPaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TYPE "StorePlanPaymentMethod" AS ENUM ('BANK_OF_PALESTINE', 'PAYPAL', 'JAWAL_PAY');

CREATE TABLE "StorePlanPaymentRequest" (
    "id" TEXT NOT NULL,
    "targetPlan" "StorePlan" NOT NULL,
    "amountIls" DOUBLE PRECISION NOT NULL,
    "method" "StorePlanPaymentMethod" NOT NULL,
    "payerName" TEXT,
    "reference" TEXT,
    "proofUrl" TEXT NOT NULL,
    "note" TEXT,
    "adminNote" TEXT,
    "status" "StorePlanPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StorePlanPaymentRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StorePlanPaymentRequest_userId_status_idx" ON "StorePlanPaymentRequest"("userId", "status");
CREATE INDEX "StorePlanPaymentRequest_status_createdAt_idx" ON "StorePlanPaymentRequest"("status", "createdAt");

ALTER TABLE "StorePlanPaymentRequest"
ADD CONSTRAINT "StorePlanPaymentRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "ProviderVerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE "ProviderVerificationRequest" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "status" "ProviderVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "reviewedNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderVerificationRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProviderVerificationRequest" ADD CONSTRAINT "ProviderVerificationRequest_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "ProviderVerificationRequest_providerId_status_idx" ON "ProviderVerificationRequest"("providerId", "status");
CREATE INDEX "ProviderVerificationRequest_status_createdAt_idx" ON "ProviderVerificationRequest"("status", "createdAt");

ALTER TABLE "JobPost" ADD COLUMN "code" TEXT;

UPDATE "JobPost"
SET "code" = 'ARZ-' || upper(substr(md5("id"), 1, 6))
WHERE "code" IS NULL;

ALTER TABLE "JobPost" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "JobPost_code_key" ON "JobPost"("code");
CREATE INDEX "JobPost_code_idx" ON "JobPost"("code");

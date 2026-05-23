-- Add indexes for high-traffic list and activity queries.
CREATE INDEX "JobPost_status_createdAt_idx" ON "JobPost"("status", "createdAt");
CREATE INDEX "JobPost_status_region_categoryId_idx" ON "JobPost"("status", "region", "categoryId");
CREATE INDEX "JobPost_isUrgent_createdAt_idx" ON "JobPost"("isUrgent", "createdAt");
CREATE INDEX "Review_receiverId_createdAt_idx" ON "Review"("receiverId", "createdAt");

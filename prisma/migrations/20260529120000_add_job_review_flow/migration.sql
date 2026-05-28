-- Add moderation states for job posts.
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';
ALTER TYPE "JobStatus" ADD VALUE IF NOT EXISTS 'NEEDS_EDIT';

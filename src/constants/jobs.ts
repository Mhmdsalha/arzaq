import type { JobStatus, WorkMode } from "@prisma/client";

export const workModeLabels: Record<WorkMode, string> = {
  ONLINE: "أونلاين",
  FIELD: "ميداني",
  BOTH: "مرن",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  PENDING_REVIEW: "قيد مراجعة الإدارة",
  NEEDS_EDIT: "يحتاج تعديل",
  OPEN: "مفتوح",
  IN_PROGRESS: "مغلق",
  COMPLETED: "مغلق",
  CANCELLED: "مغلق",
};

export const adminJobStatusLabels: Record<JobStatus, string> = {
  PENDING_REVIEW: "قيد مراجعة الإدارة",
  NEEDS_EDIT: "يحتاج تعديل",
  OPEN: "مفتوح",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "مغلق",
};

export function isJobOpen(status: JobStatus) {
  return status === "OPEN";
}

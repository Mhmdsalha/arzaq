import type { JobStatus, WorkMode } from "@prisma/client";

export const workModeLabels: Record<WorkMode, string> = {
  ONLINE: "أونلاين",
  FIELD: "ميداني",
  BOTH: "مرن",
};

export const jobStatusLabels: Record<JobStatus, string> = {
  OPEN: "مفتوح",
  IN_PROGRESS: "قيد التنفيذ",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};
